import json
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.logging_config import logger
from app.services.userinfo_service import add_or_update_userinfo, fetch_userinfo

# Create a Blueprint for user information routes under /userinfo
userinfo_bp = Blueprint('userinfo', __name__, url_prefix='/userinfo')



# Create or update the user's profile info (weight, height, goal, etc.)
@userinfo_bp.route('', methods=['POST'])
@jwt_required()
def create_or_update_userinfo():
    user_id = get_jwt_identity()  # Get the authenticated user's ID from JWT
    data = request.get_json().get('user_data')  # Extract the "user_data" object from request body
    logger.info('📦 user_data:\n' + json.dumps(data, indent=2))

    if not data:
        logger.warning(f'No user data provided for user {user_id}')
        return jsonify({'message': 'No user data provided'}), 400

    try:
        # Call service to add or update user info
        userinfo, action = add_or_update_userinfo(user_id, data)
        logger.info(f'User info {action} successfully for user {user_id}')
        return jsonify({'message': f'User info {action} successfully'}), 201

    except Exception as e:
        logger.error(f'Error processing user info for user {user_id}: {e}')
        return jsonify({'message': 'Internal Server Error'}), 500



# Retrieve the user's stored profile info
@userinfo_bp.route('', methods=['GET'])
@jwt_required()
def get_userinfo():
    user_id = int(get_jwt_identity())
    logger.info(f'user_id type: {type(user_id)}')
    logger.info(f'user_id: {user_id}')

    try:
        userinfo = fetch_userinfo(user_id)
        if not userinfo:
            logger.warning(f'User info not found for user {user_id}')
            return jsonify({'message': 'User info not found'}), 404

        # Format a structured response using ORM fields and related user model
        response = {
            'username': userinfo.user.username if userinfo.user else '',
            'email': userinfo.user.email if userinfo.user else '',
            'gender': userinfo.gender.value,
            'weight': userinfo.weight,
            'weight_unit': userinfo.weight_unit.value,
            'height_ft': userinfo.height_ft,
            'height_in': userinfo.height_in,
            'height_unit': userinfo.height_unit.value,
            'training_intensity': userinfo.training_intensity.value,
            'goal': userinfo.goal.value,
            'streak_goal': userinfo.streak_goal,
        }

        logger.info(f'Fetched user info for user {user_id}')
        return jsonify(response), 200

    except ValueError as ve:
        # Raised if user data is incomplete or has invalid enum/string conversions
        logger.warning(f'ValueError in fetch_userinfo for user {user_id}: {ve}')
        return jsonify({'message': str(ve)}), 404

    except Exception as e:
        logger.error(f'Error fetching user info for user {user_id}: {e}', exc_info=True)
        return jsonify({'message': 'Internal Server Error'}), 500
