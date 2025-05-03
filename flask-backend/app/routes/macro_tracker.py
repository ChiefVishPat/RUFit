from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.services.macro_tracker_service import create_or_update_entry, list_entries, patch_entry, remove_entry

tracker_bp = Blueprint('tracker', __name__, url_prefix='/tracker')


@tracker_bp.route('', methods=['POST'])
@jwt_required()
def create_tracker():
    try:
        rec = create_or_update_entry(get_jwt_identity(), request.get_json() or {})
        return jsonify({'message': 'Macros updated'}), 200
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception:
        return jsonify({'message': 'Error'}), 500


@tracker_bp.route('', methods=['GET'])
@jwt_required()
def get_tracker():
    date = request.args.get('date')
    try:
        entries = list_entries(get_jwt_identity(), date)
        return jsonify([e.to_dict() for e in entries]), 200
    except Exception:
        return jsonify({'message': 'Error'}), 500


@tracker_bp.route('/<int:id>', methods=['PATCH'])
@jwt_required()
def update_tracker(id):
    try:
        patch_entry(get_jwt_identity(), id, request.get_json() or {})
        return jsonify({'message': 'Entry updated'}), 200
    except LookupError:
        return jsonify({'message': 'Not found'}), 404
    except Exception:
        return jsonify({'message': 'Error'}), 500


@tracker_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_tracker(id):
    try:
        remove_entry(get_jwt_identity(), id)
        return jsonify({'message': 'Entry deleted'}), 200
    except LookupError:
        return jsonify({'message': 'Not found'}), 404
    except Exception:
        return jsonify({'message': 'Error'}), 500
