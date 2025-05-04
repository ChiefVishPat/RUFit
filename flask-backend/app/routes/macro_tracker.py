import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required, unset_jwt_cookies

from app.logging_config import logger
from app.services.macro_tracker_service import (
    create_or_update_entry,
    list_entries,
    patch_entry,
    remove_entry,
)

tracker_bp = Blueprint('tracker', __name__, url_prefix='/tracker')


@tracker_bp.route('', methods=['POST'])
@jwt_required()
def create_tracker():
    user_id = get_jwt_identity()
    payload = request.get_json() or {}
    logger.debug(f'[TRACKER POST] user={user_id} payload={payload}')
    try:
        rec = create_or_update_entry(user_id, payload)
        logger.info(f'[TRACKER] Created/updated macros for user {user_id} on {rec.date}')
        return jsonify({'message': 'Macros updated successfully'}), 200

    except ValueError as ve:
        # e.g. missing food_name
        logger.warning(f'[TRACKER] Bad request for user {user_id}: {ve}')
        return jsonify({'message': str(ve)}), 400

    except Exception as e:
        logger.error(f'[TRACKER] Error creating/updating for user {user_id}: {e}', exc_info=True)
        return jsonify({'message': 'Internal Server Error'}), 500


@tracker_bp.route('', methods=['GET'])
@jwt_required()
def get_tracker():
    user_id = get_jwt_identity()
    date_str = request.args.get('date')
    logger.debug(f'[TRACKER GET] user={user_id} date={date_str}')

    try:
        # service returns list of ORM objects
        recs = list_entries(user_id, date_str)
        out = []
        for r in recs:
            out.append(
                {
                    'id': r.id,
                    'date': r.date.isoformat(),
                    'food_name': r.food_name,
                    'barcode': getattr(r, 'barcode', None),
                    'calories': r.calories,
                    'protein': r.protein,
                    'carbs': r.carbs,
                    'fiber': r.fiber,
                    'unsat_fat': r.unsat_fat,
                    'sat_fat': r.sat_fat,
                }
            )

        return jsonify(out), 200

    except Exception as e:
        logger.error(f'[TRACKER] Error fetching for user {user_id}: {e}', exc_info=True)
        return jsonify({'message': 'Internal Server Error'}), 500


@tracker_bp.route('/<int:record_id>', methods=['PATCH'])
@jwt_required()
def update_tracker(record_id):
    user_id = get_jwt_identity()
    updates = request.get_json() or {}
    logger.debug(f'[TRACKER PATCH] user={user_id} id={record_id} updates={updates}')

    try:
        patched = patch_entry(user_id, record_id, updates)
        logger.info(f'[TRACKER] Updated entry {record_id} for user {user_id}')
        return jsonify({'message': 'Tracker entry updated successfully'}), 200

    except LookupError:
        logger.warning(f'[TRACKER] Entry {record_id} not found for user {user_id}')
        return jsonify({'message': 'Tracker entry not found'}), 404

    except Exception as e:
        logger.error(f'[TRACKER] Error updating entry {record_id} for user {user_id}: {e}', exc_info=True)
        return jsonify({'message': 'Internal Server Error'}), 500


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
