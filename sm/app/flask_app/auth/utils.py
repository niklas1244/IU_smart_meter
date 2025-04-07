import datetime
import re
from functools import wraps

import jwt
from database import get_db_connection
from flask import current_app, jsonify, request
from werkzeug.exceptions import BadRequest


def create_token(user_id, username, role_id):
    """Create a JWT token for user authentication."""
    return jwt.encode({
        'userId': user_id,
        'username': username,
        'roleId': role_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=20)
    }, current_app.config['SECRET_KEY'], algorithm='HS256')


def verify_token(token):
    """Verify if a JWT token is valid and not expired."""
    try:
        jwt.decode(token, current_app.config['SECRET_KEY'],
                   algorithms=['HS256'])
        return True
    except Exception as e:
        print(e)
        return False


def user_is_authorized(token, auth_levels: list):
    """Check if user has required authorization level."""
    try:
        decoded = jwt.decode(token, current_app.config['SECRET_KEY'],
                             algorithms=['HS256'])
        for auth_level in auth_levels:
            if decoded['roleId'] == auth_level:
                return True
        return False

    except Exception:
        return False


def get_data_from_token(token, key):
    """Extract specific data from a JWT token."""
    if verify_token(token):
        return jwt.decode(token, current_app.config['SECRET_KEY'],
                          algorithms=['HS256'])[key]
    return False


def get_user_id_for_username(username):
    """Get user ID corresponding to a username."""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT id FROM login WHERE login_username = %s",
                           (username,))
            user = cursor.fetchone()
            return user['id'] if user else -1
    except Exception:
        return -1


def validate_password(password):
    if (len(password) >= 8
            and re.search(r'[A-Z]', password)
            and re.search(r'[a-z]', password)
            and re.search(r'\d', password)
            and re.search(r'[!@#$%^&*(),.?":{}|<>]', password)):
        return True
    return False


def validate_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)


def error_response(message, status_code):
    return jsonify({"error": message}), status_code


def validate_request_data(given_request, required_fields):
    data = given_request.get_json(force=True)
    if not data:
        raise BadRequest("Request payload must be in JSON format.")

    missing_fields = [field for field in required_fields if field not in data or not data[field]]
    if missing_fields:
        raise BadRequest(f"Missing required fields: {', '.join(missing_fields)}")

    return data


def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or not verify_token(token):
            return jsonify({"error": "Invalid or missing token"}), 403
        return f(*args, **kwargs)
    return decorated_function


def require_special_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or not verify_token(token):
            return jsonify({"error": "Invalid or missing token"}), 403

        if not user_is_authorized(token, [99]):
            return jsonify({"error": "Unauthorized"}), 403

        return f(*args, **kwargs)
    return decorated_function
