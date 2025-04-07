from auth.utils import (error_response, require_special_auth, require_auth,
                        validate_request_data, user_is_authorized)
from flask import Blueprint, jsonify, request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from consumption.utils import (get_user_id, get_consumption_data,
                               get_consumption_data_for_user_in_db,
                               add_consumption_data_in_db,
                               update_consumption_data_in_db)

limiter = Limiter(get_remote_address)
consumption_bp = Blueprint('consumption', __name__)


@consumption_bp.route('/get_data', methods=['GET'])
@limiter.limit("240 per minute")
@require_auth
def get_data():
    """Retrieve consumption data in the system"""
    try:
        # Get all data if user is admin
        if user_is_authorized(request.headers.get('Authorization'), [99]):
            return jsonify(get_consumption_data(limit=10000)), 200

        # Else get data for user only
        user_id = get_user_id(request.headers.get('Authorization'))
        if user_id:
            data = get_consumption_data_for_user_in_db(user_id)
            return jsonify(data), 200

        return error_response("Unauthorized user", 403)

    except Exception as e:
        return error_response(str(e), 500)


@consumption_bp.route('/get_data_for_user/<user_id>', methods=['GET'])
@limiter.limit("20 per minute")
@require_auth
def get_consumption_data_for_user():
    """Retrieve consumption data for user."""
    try:

        user_id = get_user_id(request.headers.get('Authorization'))
        data = get_consumption_data_for_user_in_db(user_id)
        return jsonify(data), 200

    except Exception as e:
        return error_response(str(e), 500)


@consumption_bp.route('/add_data', methods=['POST'])
@limiter.limit("5 per minute")
@require_auth
def add_data():
    """Add new consumption data"""

    try:
        input_data = validate_request_data(request, ['meter_id', 'consumption_kwh'])

        if add_consumption_data_in_db(input_data):
            return jsonify({"message": "Data successfully added"}), 200

        return error_response('Data could not be added', 403)

    except Exception as e:
        return error_response(str(e), 500)


@consumption_bp.route('/update_data', methods=['POST'])
@limiter.limit("10 per minute")
@require_special_auth
def update_data():
    """Update consumption data"""

    try:
        input_data = validate_request_data(request, ['id', 'consumption_kwh'])

        if update_consumption_data_in_db(input_data):
            return jsonify({"message": "Data successfully updated"}), 200
        return error_response('Failed to update data', 400)

    except Exception as e:
        return error_response(str(e), 500)
