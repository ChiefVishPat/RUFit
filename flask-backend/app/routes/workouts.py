import uuid
from flask import Blueprint, request, jsonify
from app.models.workout import Workout
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.logging_config import logger

workouts_bp = Blueprint('workouts', __name__, url_prefix='/workout')

# Create a new workout session (multiple exercises)
@workouts_bp.route('', methods=['POST'])
@jwt_required()
def create_workout():
    user_id = get_jwt_identity()
    data = request.get_json()
    workout_name = data.get('workout_name')
    exercises = data.get('exercises')

    if not workout_name:
        logger.warning("Workout creation failed: Workout name is required for user %s", user_id)
        return jsonify({'message': 'Workout name is required'}), 400

    if not exercises or not isinstance(exercises, list):
        logger.warning("Workout creation failed: Exercises must be provided as a list for user %s", user_id)
        return jsonify({'message': 'Exercises must be provided as a list'}), 400

    # Generate a unique session ID for this workout session
    session_id = str(uuid.uuid4())

    for ex in exercises:
        if not ex.get('name') or not ex.get('sets') or not ex.get('reps'):
            logger.warning("Workout creation failed: Each exercise must include name, sets, and reps for user %s", user_id)
            return jsonify({'message': 'Each exercise must have a name, sets, and reps'}), 400

        new_workout = Workout(
            user_id=user_id,
            workout_name=workout_name,
            session_id=session_id,
            exercise=ex.get('name'),
            sets=ex.get('sets'),
            reps=ex.get('reps'),
            weight=ex.get('weight', 0)
        )
        db.session.add(new_workout)
    db.session.commit()

    logger.info("Workout session '%s' created successfully for user %s", workout_name, user_id)
    return jsonify({'message': 'Workout session created successfully'}), 201

# Update an existing workout session
@workouts_bp.route('/<string:session_id>', methods=['PUT'])
@jwt_required()
def update_workout(session_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    workout_name = data.get('workout_name')
    exercises = data.get('exercises')

    if not workout_name:
        logger.warning("Workout update failed: Workout name is required for user %s", user_id)
        return jsonify({'message': 'Workout name is required'}), 400

    if not exercises or not isinstance(exercises, list):
        logger.warning("Workout update failed: Exercises must be provided as a list for user %s", user_id)
        return jsonify({'message': 'Exercises must be provided as a list'}), 400

    # Check if the session exists
    existing_rows = Workout.query.filter_by(session_id=session_id, user_id=user_id).all()
    if not existing_rows:
        logger.warning("Workout update failed: No workout session found for session_id %s and user %s", session_id, user_id)
        return jsonify({'message': 'Workout session not found'}), 404

    # Delete existing rows for that session
    for row in existing_rows:
        db.session.delete(row)

    # Insert new rows with the same session_id
    for ex in exercises:
        if not ex.get('name') or not ex.get('sets') or not ex.get('reps'):
            logger.warning("Workout update failed: Each exercise must include name, sets, and reps for user %s", user_id)
            return jsonify({'message': 'Each exercise must have a name, sets, and reps'}), 400

        new_workout = Workout(
            user_id=user_id,
            workout_name=workout_name,
            session_id=session_id,
            exercise=ex.get('name'),
            sets=ex.get('sets'),
            reps=ex.get('reps'),
            weight=ex.get('weight', 0)
        )
        db.session.add(new_workout)
    db.session.commit()

    logger.info("Workout session '%s' updated successfully for user %s", workout_name, user_id)
    return jsonify({'message': 'Workout session updated successfully'}), 200

# Get all workout sessions grouped by session_id
@workouts_bp.route('', methods=['GET'])
@jwt_required()
def get_workouts():
    user_id = get_jwt_identity()
    rows = Workout.query.filter_by(user_id=user_id).all()
    grouped_sessions = {}
    for w in rows:
        key = w.session_id
        if key not in grouped_sessions:
            grouped_sessions[key] = {
                'session_id': w.session_id,
                'workout_name': w.workout_name,
                'date': w.date.strftime('%Y-%m-%d %H:%M:%S'),
                'exercises': []
            }
        grouped_sessions[key]['exercises'].append({
            'id': w.id,
            'exercise': w.exercise,
            'sets': w.sets,
            'reps': w.reps,
            'weight': w.weight,
        })
    sessions = list(grouped_sessions.values())
    return jsonify(sessions), 200

# Delete a single workout row (if you want to delete one exercise)
# Alternatively, you might want to delete the entire session
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