import datetime
from flask import Blueprint, request, jsonify
from app.models.macro_tracker import Tracker
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.logging_config import logger

tracker_bp = Blueprint('tracker', __name__, url_prefix='/tracker')

@tracker_bp.route('', methods=['POST'])
@jwt_required()
def create_tracker():
    user_id = get_jwt_identity()
    data = request.get_json()
    today = datetime.datetime.utcnow().date()

    # Retrieve any existing tracker record for today
    tracker_record = Tracker.query.filter_by(user_id=user_id, date=today).first()

    # Require food name for tracking
    food_name = data.get('food_name')
    if not food_name:
        logger.warning("Tracker creation failed: Food name is required for user %s", user_id)
        return jsonify({'message': 'Food name is required'}), 400

    try:
        if tracker_record is None:
            # Create a new tracker record for today
            tracker_record = Tracker(
                user_id=user_id,
                food_name=food_name,
                calorie=data.get('calories', 0),
                protein=data.get('protein', 0),
                unsat_fat=data.get('unsaturated_fats', 0),
                sat_fat=data.get('saturated_fats', 0),
                fiber=data.get('fiber', 0),
                carbs=data.get('carbs', 0),
                date=today
            )
            db.session.add(tracker_record)
            logger.info("Created new tracker record for user %s on %s", user_id, today)
        else:
            # Update the existing tracker record for today
            tracker_record.calorie += data.get('calories', 0)
            tracker_record.protein += data.get('protein', 0)
            tracker_record.unsat_fat += data.get('unsaturated_fats', 0)
            tracker_record.sat_fat += data.get('saturated_fats', 0)
            tracker_record.fiber += data.get('fiber', 0)
            tracker_record.carbs += data.get('carbs', 0)
            logger.info("Updated tracker record for user %s on %s", user_id, today)
        
        db.session.commit()
        return jsonify({'message': 'Macros updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        logger.error("Error updating tracker for user %s: %s", user_id, e)
        return jsonify({'message': 'Internal Server Error'}), 500

@tracker_bp.route('', methods=['GET'])
@jwt_required()
def get_tracker():
    user_id = get_jwt_identity()
    date_param = request.args.get('date')

    if date_param:
        try:
            date_obj = datetime.datetime.strptime(date_param, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD'}), 400
    else:
        date_obj = datetime.datetime.utcnow().date()

    tracker_record = Tracker.query.filter_by(user_id=user_id, date=date_obj).first()

    if not tracker_record:
        return jsonify({'message': 'No macro data for this date'}), 404

    return jsonify({
        'date': tracker_record.date.strftime('%Y-%m-%d'),
        'calories': tracker_record.calorie,
        'protein': tracker_record.protein,
        'carbs': tracker_record.carbs,
        'fiber': tracker_record.fiber,
        'unsat_fat': tracker_record.unsat_fat,
        'sat_fat': tracker_record.sat_fat,
    }), 200