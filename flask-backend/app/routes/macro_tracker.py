from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required, unset_jwt_cookies

from app.logging_config import logger
from app.services.macro_tracker_service import (
    create_or_update_entry,
    list_entries,
    patch_entry,
    remove_entry,
)

# Initialize Blueprint for macro tracking routes
# All routes defined below will be prefixed with /tracker, and if it has jwt required it needs auth tokens
tracker_bp = Blueprint('tracker', __name__, url_prefix='/tracker')


# Create a new macro entry or update an existing one for the same date + food
@tracker_bp.route('', methods=['POST'])
@jwt_required()
def create_tracker():
    user_id = get_jwt_identity()  # Get user ID from JWT token
    payload = request.get_json() or {}  # Safely extract JSON body
    logger.debug(f'[TRACKER POST] user={user_id} payload={payload}')

    try:
        # Create a new entry or update if one exists for that date + food
        rec = create_or_update_entry(user_id, payload)
        logger.info(f'[TRACKER] Created/updated macros for user {user_id} on {rec.date}')
        return jsonify({'message': 'Macros updated successfully'}), 200

    except ValueError as ve:
        # Typically raised if required fields like 'food_name' are missing
        logger.warning(f'[TRACKER] Bad request for user {user_id}: {ve}')
        return jsonify({'message': str(ve)}), 400

    except Exception as e:
        logger.error(f'[TRACKER] Error creating/updating for user {user_id}: {e}', exc_info=True)
        return jsonify({'message': 'Internal Server Error'}), 500



# Fetch all macro logs for a user, or filter by date if ?date=YYYY-MM-DD is provided
@tracker_bp.route('', methods=['GET'])
@jwt_required()
def get_tracker():
    user_id = get_jwt_identity()
    date_str = request.args.get('date')  # Optional query param for filtering by date
    logger.debug(f'[TRACKER GET] user={user_id} date={date_str}')

    try:
        # Fetch all or date-filtered entries from service
        recs = list_entries(user_id, date_str)
        out = []

        # Convert ORM objects into serializable dictionaries
        for r in recs:
            out.append({
                'id': r.id,
                'date': r.date.isoformat(),
                'food_name': r.food_name,
                'barcode': getattr(r, 'barcode', None),  # Some entries may not have a barcode
                'calories': r.calories,
                'protein': r.protein,
                'carbs': r.carbs,
                'fiber': r.fiber,
                'unsat_fat': r.unsat_fat,
                'sat_fat': r.sat_fat,
            })

        return jsonify(out), 200

    except Exception as e:
        logger.error(f'[TRACKER] Error fetching for user {user_id}: {e}', exc_info=True)
        return jsonify({'message': 'Internal Server Error'}), 500



# Update fields for a specific macro log (identified by ID)
@tracker_bp.route('/<int:record_id>', methods=['PATCH'])
@jwt_required()
def update_tracker(record_id):
    user_id = get_jwt_identity()
    updates = request.get_json() or {}
    logger.debug(f'[TRACKER PATCH] user={user_id} id={record_id} updates={updates}')

    try:
        patched = patch_entry(user_id, record_id, updates)
        logger.info(f'Here is the patched data: {patched}')
        logger.info(f'[TRACKER] Updated entry {record_id} for user {user_id}')
        return jsonify({'message': 'Tracker entry updated successfully'}), 200

    except LookupError:
        # Record not found or doesn't belong to user
        logger.warning(f'[TRACKER] Entry {record_id} not found for user {user_id}')
        return jsonify({'message': 'Tracker entry not found'}), 404

    except Exception as e:
        logger.error(f'[TRACKER] Error updating entry {record_id} for user {user_id}: {e}', exc_info=True)
        return jsonify({'message': 'Internal Server Error'}), 500


# Permanently remove a specific macro log
@tracker_bp.route('/<int:record_id>', methods=['DELETE'])
@jwt_required()
def delete_tracker(record_id):
    user_id = get_jwt_identity()
    logger.debug(f'[TRACKER DELETE] user={user_id} id={record_id}')

    try:
        remove_entry(user_id, record_id)
        logger.info(f'[TRACKER] Deleted entry {record_id} for user {user_id}')
        return jsonify({'message': 'Tracker entry deleted successfully'}), 200

    except LookupError:
        logger.warning(f'[TRACKER] Entry {record_id} not found for user {user_id}')
        return jsonify({'message': 'Tracker entry not found'}), 404

    except Exception as e:
        logger.error(f'[TRACKER] Error deleting entry {record_id} for user {user_id}: {e}', exc_info=True)
        return jsonify({'message': 'Internal Server Error'}), 500
``
