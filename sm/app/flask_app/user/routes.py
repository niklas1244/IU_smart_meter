from auth.utils import (error_response, get_data_from_token, require_auth,
                        user_is_authorized, validate_request_data, require_special_auth)
from database import get_db_connection
from flask import Blueprint, jsonify, request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

user_bp = Blueprint('user', __name__)
limiter = Limiter(get_remote_address)


@user_bp.route('/get_user', methods=['GET'])
@limiter.limit("240 per minute")
@require_auth
def get_user():
    """Retrieve a specific user's information"""
    try:
        authenticated_user_id = get_data_from_token(
            request.headers.get('Authorization'), 'userId')

        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                """SELECT id, first_name, last_name, email, 
                    phone, address, city, zip_code
                    FROM users WHERE id = %s""",
                (authenticated_user_id,)
            )
            user = cursor.fetchone()

        return jsonify(user), 200

    except Exception as e:
        return error_response(str(e), 500)


@user_bp.route('/update_user', methods=['POST'])
@limiter.limit("120 per minute")
@require_auth
def update_user():
    """Update user profile information"""

    try:
        token = request.headers.get('Authorization')
        authenticated_user_id = get_data_from_token(token, 'userId')

        required_fields = ['email', 'first_name', 'last_name', 'phone',
                           'address', 'city', 'zip_code', 'id']
        input_data = validate_request_data(request,
                                           required_fields)
        required_fields.pop()
        user_id = input_data['id']

        # User can only update their own information. Or Admin can update
        if (user_id != authenticated_user_id
                and not user_is_authorized(token, [99])):
            return error_response('Unauthorized', 403)

        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            update_fields = {field: input_data[field] for field in
                             required_fields}
            update_query = ", ".join(
                [f"{field} = %s" for field in update_fields.keys()])
            cursor.execute(
                f"UPDATE users SET {update_query} WHERE id = %s",
                (*update_fields.values(), user_id)
            )
            conn.commit()

        return jsonify({"message": "User updated successfully"}), 200

    except Exception as e:
        return error_response(str(e), 500)


@user_bp.route('/get_all', methods=['GET'])
@limiter.limit("20 per minute")
@require_special_auth
def get_all():
    """Get all users"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                """SELECT id, first_name, last_name FROM users"""
            )
            users = cursor.fetchall()

        return jsonify(users), 200

    except Exception as e:
        return error_response(str(e), 500)
