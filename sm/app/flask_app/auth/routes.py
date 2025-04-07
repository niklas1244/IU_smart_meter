from auth.utils import (create_token, error_response, get_data_from_token,
                        get_user_id_for_username, require_auth,
                        require_special_auth, user_is_authorized,
                        validate_email, validate_password,
                        validate_request_data)
from database import get_db_connection
from flask import Blueprint, jsonify, request
from flask_bcrypt import Bcrypt
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

bcrypt = Bcrypt()
limiter = Limiter(get_remote_address)
auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/signup', methods=['POST'])
@limiter.limit("10 per minute")
def create_user():
    """Create a new user account"""
    try:

        # Validate the request data
        input_data = validate_request_data(request,
                                           ['username', 'password', 'email',
                                            'firstName', 'lastName', 'phone',
                                            'address', 'city', 'zipCode'])

        username = input_data['username'].strip()
        password = input_data['password']

        # Special validation for email
        if not validate_email(input_data['email']):
            return error_response("Invalid email format", 400)

        # Check if the username already exists
        if get_user_id_for_username(username) > 0:
            return error_response("Username already exists", 400)

        # Validate password strength
        if not validate_password(password):
            return error_response(
                "Password must be at least 8 characters long, "
                "include an uppercase letter, a number, and a special character",
                400)

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        # All users are created as regular users (role_id = 1) by default
        role_id = 1

        with get_db_connection() as conn:
            cursor = conn.cursor()

            # Create a new user
            cursor.execute(
                """INSERT INTO users (
                first_name, last_name, phone, 
                email, address, city, zip_code)
                VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                (input_data['firstName'],
                 input_data['lastName'],
                 input_data['phone'],
                 input_data['email'],
                 input_data['address'],
                 input_data['city'],
                 input_data['zipCode']))
            conn.commit()

            # Get the user ID
            cursor.execute(
                """SELECT DISTINCT id FROM users WHERE email = %s LIMIT 1""",
                (input_data['email'],))
            user_id = cursor.fetchone()

            if not user_id:
                return error_response("Failed to retrieve user ID", 500)

            # Create a new login
            cursor.execute(
                """INSERT INTO login (
                login_username, login_password, user_id, role_id)
                VALUES (%s, %s, %s, %s)""",
                (username, hashed_password, user_id[0], role_id))
            conn.commit()

        # Create a token for the user
        token = create_token(user_id[0], username, role_id)

        # Return the token
        return jsonify({"message": "User created successfully",
                        "token": token}), 200

    except Exception as e:
        return error_response(str(e), 500)


@auth_bp.route('/login', methods=['POST'])
@limiter.limit("2/minute")
def login():
    """Authenticate a user and create a session"""
    try:

        # Validate the request data
        input_data = validate_request_data(request, ['username', 'password'])
        username = input_data['username'].strip()
        password = input_data['password']

        # Try to find the user in the database
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                """SELECT user_id, login_password, lock_count, lock_reason, role_id
                FROM login WHERE login_username = %s""",
                (username,))
            user = cursor.fetchone()

        # If no user is found, return an error
        if not user:
            return error_response("Invalid credentials", 401)

        # Check the users lock count. If it is 5 or more, return an error
        if user['lock_count'] >= 5:
            return error_response("Account is locked", 403)

        # Check if the provided password matches the stored password
        if user and (user['login_password'] == password
                     or bcrypt.check_password_hash(user['login_password'],
                                                   password)):
            token = create_token(user['user_id'], username, user['role_id'])
            return jsonify(
                {"message": "Login successful", "token": token}), 200

        # If the password is incorrect, increment the lock count
        lock_reason = "Too many failed attempts"
        with get_db_connection() as conn:
            cursor = conn.cursor()

            # Increase the lock count up to 4. If exceed set the lock reason and lock the account
            if user['lock_count'] >= 4:
                cursor.execute("""
                    UPDATE login SET lock_count = lock_count + 1, lock_reason = %s 
                    WHERE login_username = %s
                """, (lock_reason, username))
            else:
                cursor.execute("""
                    UPDATE login SET lock_count = lock_count + 1
                    WHERE login_username = %s
                """, (username,))
            conn.commit()

        return error_response("Invalid credentials", 401)

    except Exception as e:
        return error_response(str(e), 500)


@auth_bp.route('/delete_user', methods=['DELETE'])
@limiter.limit("20 per minute")
@require_auth
def delete_user():
    """Delete a user account."""
    try:

        # Validate the request data
        input_data = validate_request_data(request, ['username'])
        token = request.headers.get('Authorization')

        # Check if the user is authorized to delete the account. Admins (99) can delete any account
        if get_data_from_token(token, 'username') != input_data['username']:
            if not user_is_authorized(token, [99]):
                return error_response("Unauthorized", 403)

        # Delete the user account. First the login and then the user itself
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""DELETE FROM login WHERE login_username = %s""",
                           (input_data['username'],))

            cursor.execute("""DELETE FROM users WHERE email = %s""",
                           (input_data['username'],))
            conn.commit()

        return jsonify({"message": "User deleted successfully"}), 200

    except Exception as e:
        return error_response(str(e), 500)


@auth_bp.route('/unlock_user', methods=['POST'])
@limiter.limit("5 per minute")
@require_special_auth
def unlock_user():
    """Unlock a user account.
        Can only be done by users with role 99 (admin) -> @require_special_auth
    """
    try:

        # Validate the request data
        input_data = validate_request_data(request, ['username_to_unlock'])
        username_to_unlock = input_data['username_to_unlock'].strip()

        # Unlock the user account
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """UPDATE login SET lock_count = 0, lock_reason = ''
                WHERE login_username = %s""",
                (username_to_unlock,))
            conn.commit()

        return jsonify({"message": "User unlocked"}), 200

    except Exception as e:
        return error_response(str(e), 500)


@auth_bp.route('/change_password', methods=['POST'])
@limiter.limit("20 per minute")
@require_auth
def change_password():
    """Change a user's password."""
    try:

        # Validate the request data
        input_data = validate_request_data(request,
                                           ['username', 'old_password',
                                            'new_password'])

        username = input_data['username'].strip()
        old_password = input_data['old_password']
        new_password = input_data['new_password']

        # Validate the new password against the password policy
        if not validate_password(new_password):
            return error_response(
                "Password must be at least 8 characters long, "
                "include an uppercase letter, a number, and a special character",
                400)

        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                """SELECT login_password FROM login WHERE login_username = %s""",
                (username,))
            user = cursor.fetchone()

        # Check if the user exists and if the old password is correct
        if not user or not bcrypt.check_password_hash(user['login_password'],
                                                      old_password):
            return error_response("Invalid username or password", 401)

        # Create the password hash form the plain password
        hashed_new_password = bcrypt.generate_password_hash(new_password).decode('utf-8')

        # Change the password in the database
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE login SET login_password = %s WHERE login_username = %s""",
                           (hashed_new_password, username))
            conn.commit()

        return jsonify({"message": "Password changed successfully"}), 200

    except Exception as e:
        return error_response(str(e), 500)
