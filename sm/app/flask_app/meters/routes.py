from auth.utils import (error_response, require_auth, require_special_auth,
                        validate_request_data, user_is_authorized)
from flask import Blueprint, jsonify, request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from meters.utils import (get_user_id, get_meters, create_meter_in_db)

meters_bp = Blueprint('meters', __name__)
limiter = Limiter(get_remote_address)


@meters_bp.route('/get_data', methods=['GET'])
@limiter.limit("30 per minute")
@require_auth
def get_data():
    """Retrieve all meters in the system."""
    try:

        # Get all data if user is admin
        if user_is_authorized(request.headers.get('Authorization'), [99]):
            return jsonify(get_meters()), 200

        # Else get data for user only
        user_id = get_user_id(request.headers.get('Authorization'))
        if user_id:
            data = get_meters(user_id=user_id)
            return jsonify(data), 200

        return error_response("Unauthorized user", 403)

    except Exception as e:
        return error_response(str(e), 500)


@meters_bp.route('/add_meter', methods=['POST'])
@limiter.limit("60 per minute")
@require_special_auth
def add_meter():
    """Create a new meter"""
    try:
        user_id = get_user_id(request.headers.get('Authorization'),
                              request.get_json(force=True))

        input_data = validate_request_data(request, ["meter_id", "owner_id"])
        if user_id and input_data:
            if create_meter_in_db(
                    owner_id=input_data['owner_id'],
                    meter_id=input_data['meter_id'],
                    created_by=user_id):
                return jsonify({"message": "Meter created successfully"}), 200

        return error_response("Meter could not be created", 403)

    except Exception as e:
        return error_response(str(e), 500)
