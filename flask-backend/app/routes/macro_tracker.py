import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.logging_config import logger
from app.models.macro_tracker import Tracker
import request

tracker_bp = Blueprint('tracker', __name__, url_prefix='/tracker')


@tracker_bp.route('', methods=['POST'])
@jwt_required()
def create_tracker():
    user_id = get_jwt_identity()
    data = request.get_json()
    today = datetime.datetime.utcnow().date()

    # Validate required field
    food_name = data.get('food_name')
    if not food_name:
        logger.warning(f'Tracker creation failed: Food name is required for user {user_id}')
        return jsonify({'message': 'Food name is required'}), 400

    try:
        tracker_record = Tracker.query.filter_by(user_id=user_id, date=today).first()
        if tracker_record is None:
            tracker_record = Tracker(
                user_id=user_id,
                food_name=food_name,
                calorie=data.get('calories', 0),
                protein=data.get('protein', 0),
                unsat_fat=data.get('unsaturated_fats', 0),
                sat_fat=data.get('saturated_fats', 0),
                fiber=data.get('fiber', 0),
                carbs=data.get('carbs', 0),
                date=today,
            )
            db.session.add(tracker_record)
            logger.info(f'Created tracker record for user {user_id} on {today}')
        else:
            tracker_record.calorie += data.get('calories', 0)
            tracker_record.protein += data.get('protein', 0)
            tracker_record.unsat_fat += data.get('unsaturated_fats', 0)
            tracker_record.sat_fat += data.get('saturated_fats', 0)
            tracker_record.fiber += data.get('fiber', 0)
            tracker_record.carbs += data.get('carbs', 0)
            logger.info(f'Updated tracker record for user {user_id} on {today}')
        db.session.commit()
        return jsonify({'message': 'Macros updated successfully'}), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f'Error updating tracker for user {user_id}: {e}')
        return jsonify({'message': 'Internal Server Error'}), 500

#code below is a skeleton for the barcode back end, not functinal as intended yet
'''
@app.route('/api/scan-barcode', methods=['POST'])
@jwt_required()
def scan_barcode():
    data = request.get_json()
    user_id = get_jwt_identity()
    barcode = data.get('barcode')

    if not barcode:
        return jsonify({'error': 'No barcode provided'}), 400

    url = f'https://world.openfoodfacts.org/api/v0/product/{barcode}.json'
    res = requests.get(url)

    if res.status_code != 200 or res.json().get('status') != 1:
        return jsonify({'error': 'Product not found'}), 404

    product = res.json()['product']
    nutriments = product.get('nutriments', {})

    #dictionary for the api
    macro= {
        'food_name': product.get('product_name', 'Unknown'),
        'calories': nutriments.get('energy-kcal_100g', 0),
        'protein': nutriments.get('proteins_100g', 0),
        'carbs': nutriments.get('carbohydrates_100g', 0),
        'fat': nutriments.get('fat_100g', 0),
    }

    # You could save this to a FoodLog model here too if needed
    return jsonify(tracker), 200
'''

@tracker_bp.route('', methods=['GET'])
@jwt_required()
def get_tracker():
    user_id = get_jwt_identity()
    date_param = request.args.get('date')
    try:
        if date_param:
            date_obj = datetime.datetime.strptime(date_param, '%Y-%m-%d').date()
        else:
            date_obj = datetime.datetime.utcnow().date()
    except Exception as e:
        logger.warning(f'Invalid date format provided by user {user_id}: {e}')
        return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD'}), 400

    try:
        tracker_record = Tracker.query.filter_by(user_id=user_id, date=date_obj).first()
        if not tracker_record:
            return jsonify({'message': 'No macro data for this date'}), 404

        return jsonify(
            {
                'date': tracker_record.date.strftime('%Y-%m-%d'),
                'food_name': tracker_record.food_name,
                'calories': tracker_record.calorie,
                'protein': tracker_record.protein,
                'carbs': tracker_record.carbs,
                'fiber': tracker_record.fiber,
                'unsat_fat': tracker_record.unsat_fat,
                'sat_fat': tracker_record.sat_fat,
            }
        ), 200

    except Exception as e:
        logger.error(f'Error fetching tracker for user {user_id}: {e}')
        return jsonify({'message': 'Internal Server Error'}), 500
