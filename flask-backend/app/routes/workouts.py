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
    workout_name = data.get('workout_name')
    exercises = data.get('exercises')

    # Validate payload
    if not workout_name:
        logger.warning("Workout creation failed: Workout name is required for user %s", user_id)
        return jsonify({'message': 'Workout name is required'}), 400

    if not exercises or not isinstance(exercises, list):
        logger.warning("Workout creation failed: Exercises must be provided as a list for user %s", user_id)
        return jsonify({'message': 'Exercises must be provided as a list'}), 400

    # Iterate over each exercise and insert a row
    for ex in exercises:
        if not ex.get('name') or not ex.get('sets') or not ex.get('reps'):
            logger.warning("Workout creation failed: Each exercise must include name, sets, and reps for user %s", user_id)
            return jsonify({'message': 'Each exercise must have a name, sets, and reps'}), 400

        new_workout = Workout(
            user_id=user_id,
            workout_name=workout_name,
            exercise=ex.get('name'),
            sets=ex.get('sets'),
            reps=ex.get('reps'),
            weight=ex.get('weight', 0)
        )
        db.session.add(new_workout)
    db.session.commit()

    logger.info("Workout session '%s' created successfully for user %s", workout_name, user_id)
    return jsonify({'message': 'Workout session created successfully'}), 201

@workouts_bp.route('', methods=['GET'])
@jwt_required()
def get_workouts():
    user_id = get_jwt_identity()
    workouts = Workout.query.filter_by(user_id=user_id).all()
    logger.info("Fetching workouts for user %s", user_id)
    return jsonify([{
        'id': w.id,
        'workout_name': w.workout_name,
        'exercise': w.exercise,
        'sets': w.sets,
        'reps': w.reps,
        'weight': w.weight,
        'date': w.date.strftime('%Y-%m-%d %H:%M:%S')
    } for w in workouts]), 200

@workouts_bp.route('/<int:workout_id>', methods=['DELETE'])
@jwt_required()
def delete_workout(workout_id):
    user_id = get_jwt_identity()
    workout = Workout.query.filter_by(id=workout_id, user_id=user_id).first()
    if not workout:
        logger.warning("Workout with id %s not found for user %s", workout_id, user_id)
        return jsonify({'message': 'Workout not found'}), 404

    db.session.delete(workout)
    db.session.commit()
    logger.info("Workout with id %s deleted for user %s", workout_id, user_id)
    return jsonify({'message': 'Workout removed!'}), 200

