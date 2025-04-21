from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.logging_config import logger
from app.services.recommendation_service import calculate_recommendations

recommendations_bp = Blueprint('recommendations', __name__, url_prefix='/recommendations')


@recommendations_bp.route('', methods=['GET'])
@jwt_required()
def get_recommendations():
    """
    API endpoint to fetch workout recommendations for the logged-in user.
    Recommendations are calculated on-demand based on user profile and workout history.
    """
    user_id = get_jwt_identity()
    logger.info(f"Received recommendation request for user_id: {user_id}")

    try:
        recs = calculate_recommendations(user_id)
        if 'error' in recs:
             logger.warning(f"Recommendation calculation failed for user {user_id}: {recs['error']}")
             return jsonify({'message': recs['error']}), 404 # Or 400 depending on error type
        if 'message' in recs and not recs.keys() - {'message'}: # Handle message-only responses (e.g., no history)
             logger.info(f"Sending informational message to user {user_id}: {recs['message']}")
             return jsonify(recs), 200

        logger.info(f"Successfully generated recommendations for user {user_id}")
        return jsonify(recs), 200

    except Exception as e:
        logger.error(f"Unexpected error fetching recommendations for user {user_id}: {e}", exc_info=True)
        return jsonify({'message': 'Internal Server Error generating recommendations'}), 500