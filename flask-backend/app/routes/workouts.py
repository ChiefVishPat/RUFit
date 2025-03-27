from flask import Blueprint, request, jsonify
from app.models.workout import Workout
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.logging_config import logger

workouts_bp = Blueprint('workouts', __name__, url_prefix='/workout')

@workouts_bp.route('', methods=['POST'])
@jwt_required()
def create_workout():
    user_id = get_jwt_identity()
    data = request.get_json()
    exercise = data.get('exercise')
    reps = data.get('reps')
    sets = data.get('sets')
    weight = data.get('weight', 0)

    logger.info("User %s is creating a workout: %s", user_id, exercise)

    if not exercise or not reps or not sets:
        logger.warning("Workout creation failed: Missing required fields for user %s", user_id)
        return jsonify({'message': 'You must enter a value for all fields'}), 400

    new_workout = Workout(user_id=user_id, exercise=exercise, reps=reps, sets=sets, weight=weight)
    db.session.add(new_workout)
    db.session.commit()

    logger.info("Workout created successfully for user %s", user_id)
    return jsonify({'message': 'Good Work!'}), 201

@workouts_bp.route('', methods=['GET'])
@jwt_required()
def get_workouts():
    user_id = get_jwt_identity()
    workouts = Workout.query.filter_by(user_id=user_id).all()

    logger.info("Fetching workouts for user %s", user_id)
    return jsonify([{
        'exercise': w.exercise,
        'sets': w.sets,
        'reps': w.reps,
        'weight': w.weight,
        'date': w.date.strftime('%Y-%m-%d %H:%M:%S')
    } for w in workouts]), 200
