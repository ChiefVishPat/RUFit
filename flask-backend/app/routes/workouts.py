import uuid
from datetime import datetime, timedelta

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.logging_config import logger
from app.services.workout_service import (
    add_workout,
    get_user_workouts,
    remove_workout_session,
    update_workout_session,
)

# Define Blueprint for workout-related endpoints
workouts_bp = Blueprint('workouts', __name__, url_prefix='/workout')



# Calculates user's current workout streak (consecutive days with logged workouts)
@workouts_bp.route('/streak', methods=['GET'])
@jwt_required()
def get_streak():
    user_id = get_jwt_identity()
    try:
        workouts = get_user_workouts(user_id)
        if not workouts:
            return jsonify({'streak': 0}), 200

        # Get unique workout dates (as date objects, not datetime)
        workout_dates = sorted({w.date.date() for w in workouts}, reverse=True)

        # Count how many consecutive days the user worked out, starting from today
        streak = 0
        today = datetime.utcnow().date()
        for date in workout_dates:
            if date == today - timedelta(days=streak):
                streak += 1
            else:
                break

        return jsonify({'streak': streak}), 200
    except Exception as e:
        print(f'[STREAK ERROR] {e}')
        return jsonify({'error': 'Could not compute streak.'}), 500



# Create a new workout session with multiple exercises
@workouts_bp.route('', methods=['POST'])
@jwt_required()
def create_workout():
    user_id = get_jwt_identity()
    data = request.get_json()
    workout_name = data.get('workout_name')
    exercises = data.get('exercises')

    # Validate workout name
    if not workout_name or workout_name.strip() == '':
        logger.warning(f'Workout creation failed: Workout name is required for user {user_id}')
        return jsonify({'message': 'Workout name is required'}), 400

    # Validate exercises
    if not exercises or not isinstance(exercises, list):
        logger.warning(f'Workout creation failed: Exercises must be provided as a list for user {user_id}')
        return jsonify({'message': 'Exercises must be provided as a list'}), 400

    # Generate a unique ID for this workout session
    session_id = str(uuid.uuid4())

    try:
        for ex in exercises:
            exercise_name = ex.get('name')
            sets = ex.get('sets')
            reps = ex.get('reps')

            # Validate fields for each exercise
            if not exercise_name or not str(sets).strip() or not str(reps).strip():
                logger.warning(
                    f'Workout creation failed: Each exercise must include valid name, sets, and reps for user {user_id}'
                )
                return jsonify({'message': 'Each exercise must include a name, sets, and reps'}), 400

            # Add each exercise to the DB
            add_workout(user_id, workout_name, session_id, exercise_name, sets, reps, ex.get('weight', 0))

        logger.info(f"Workout session '{workout_name}' created successfully for user {user_id}")
        return jsonify({'message': 'Workout session created successfully'}), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f'Error creating workout session for user {user_id}: {e}')
        return jsonify({'message': 'Internal Server Error'}), 500



# Overwrite an existing workout session (all exercises replaced)
@workouts_bp.route('/<string:session_id>', methods=['PUT'])
@jwt_required()
def update_workout(session_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    workout_name = data.get('workout_name')
    exercises = data.get('exercises')

    # Validate input
    if not workout_name or workout_name.strip() == '':
        return jsonify({'message': 'Workout name is required'}), 400
    if not exercises or not isinstance(exercises, list):
        return jsonify({'message': 'Exercises must be provided as a list'}), 400

    try:
        success = update_workout_session(user_id, session_id, workout_name, exercises)
        if success:
            logger.info(f"Workout session '{workout_name}' updated successfully for user {user_id}")
            return jsonify({'message': 'Workout session updated successfully'}), 200
        else:
            logger.warning(f"Workout session '{session_id}' not found for user {user_id}")
            return jsonify({'message': 'Workout session failed to update'}), 404

    except Exception as e:
        db.session.rollback()
        logger.error(f'Error updating workout session for user {user_id}: {e}')
        return jsonify({'message': 'Internal Server Error'}), 500



# Retrieve all workout sessions, grouped by session_id
@workouts_bp.route('', methods=['GET'])
@jwt_required()
def get_workouts():
    user_id = get_jwt_identity()
    try:
        workouts = get_user_workouts(user_id)
        grouped_sessions = {}

        # Organize exercises into sessions
        for w in workouts:
            if w.session_id not in grouped_sessions:
                grouped_sessions[w.session_id] = {
                    'session_id': w.session_id,
                    'workout_name': w.workout_name,
                    'date': w.date.strftime('%Y-%m-%d %H:%M:%S'),
                    'exercises': [],
                }
            grouped_sessions[w.session_id]['exercises'].append({
                'id': w.id,
                'exercise': w.exercise,
                'sets': w.sets,
                'reps': w.reps,
                'weight': w.weight,
            })

        return jsonify(list(grouped_sessions.values())), 200

    except Exception as e:
        logger.error(f'Error fetching workouts for user {user_id}: {e}')
        return jsonify({'message': 'Internal Server Error'}), 500



# Delete a full workout session and all its exercises
@workouts_bp.route('/<string:session_id>', methods=['DELETE'])
@jwt_required()
def delete_workout_session(session_id):
    user_id = get_jwt_identity()
    try:
        success = remove_workout_session(user_id, session_id)
        if not success:
            return jsonify({'message': 'Workout session not found'}), 404
        return jsonify({'message': 'Workout session removed!'}), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f'Error deleting workout session {session_id} for user {user_id}: {e}')
        return jsonify({'message': 'Internal Server Error'}), 500
