import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.logging_config import logger
from app.models.macro_tracker import Tracker

import requests

tracker_bp = Blueprint('tracker', __name__, url_prefix='/tracker')


@tracker_bp.route('', methods=['POST'])
@jwt_required()
def create_tracker():
    user_id = get_jwt_identity()
    data = request.get_json()
    today = datetime.datetime.utcnow().date()

    food_name = data.get('food_name')
    barcode = data.get('barcode')  
    macros = {
        'calories': data.get('calories'),
        'protein': data.get('protein'),
        'unsaturated_fats': data.get('unsaturated_fats'),
        'saturated_fats': data.get('saturated_fats'),
        'fiber': data.get('fiber'),
        'carbs': data.get('carbs'),
    }

    # Try to fetch data from barcode if provided
    if barcode:
        try:
            api_url = f'https://world.openfoodfacts.org/api/v0/product/{barcode}.json'
            response = requests.get(api_url)
            if response.status_code == 200:
                product = response.json().get('product', {})
                nutriments = product.get('nutriments', {})

                macros['calories'] = macros['calories'] or nutriments.get('energy-kcal_100g', 0)
                macros['protein'] = macros['protein'] or nutriments.get('proteins_100g', 0)
                macros['unsaturated_fats'] = macros['unsaturated_fats'] or (
                    nutriments.get('fat_100g', 0) - nutriments.get('saturated-fat_100g', 0)
                )
                macros['saturated_fats'] = macros['saturated_fats'] or nutriments.get('saturated-fat_100g', 0)
                macros['fiber'] = macros['fiber'] or nutriments.get('fiber_100g', 0)
                macros['carbs'] = macros['carbs'] or nutriments.get('carbohydrates_100g', 0)

                food_name = food_name or product.get('product_name', 'Unknown')
                logger.info(f'Barcode data fetched for user {user_id}')
            else:
                logger.warning(f'Failed to fetch barcode data for {barcode}, status {response.status_code}')
        except Exception as e:
            logger.error(f'Error fetching product from barcode {barcode} for user {user_id}: {e}')
            return jsonify({'message': 'Error fetching data from barcode'}), 500

    if not food_name:
        logger.warning(f'Tracker creation failed: Food name is required for user {user_id}')
        return jsonify({'message': 'Food name is required'}), 400

    try:
        tracker_record = Tracker.query.filter_by(user_id=user_id, date=today).first()
        if tracker_record is None:
            tracker_record = Tracker(
                user_id=user_id,
                food_name=food_name,
                calorie=macros['calories'] or 0,
                protein=macros['protein'] or 0,
                unsat_fat=macros['unsaturated_fats'] or 0,
                sat_fat=macros['saturated_fats'] or 0,
                fiber=macros['fiber'] or 0,
                carbs=macros['carbs'] or 0,
                date=today,
            )
            db.session.add(tracker_record)
            logger.info(f'Created tracker record for user {user_id} on {today}')
        else:
            tracker_record.calorie += macros['calories'] or 0
            tracker_record.protein += macros['protein'] or 0
            tracker_record.unsat_fat += macros['unsaturated_fats'] or 0
            tracker_record.sat_fat += macros['saturated_fats'] or 0
            tracker_record.fiber += macros['fiber'] or 0
            tracker_record.carbs += macros['carbs'] or 0
            logger.info(f'Updated tracker record for user {user_id} on {today}')
        db.session.commit()
        return jsonify({'message': 'Macros updated successfully'}), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f'Error updating tracker for user {user_id}: {e}')
        return jsonify({'message': 'Internal Server Error'}), 500





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
