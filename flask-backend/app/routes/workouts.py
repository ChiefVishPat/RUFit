import uuid

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
from datetime import datetime, timedelta

workouts_bp = Blueprint('workouts', __name__, url_prefix='/workout')

@workouts_bp.route('/streak', methods=['GET'])
@jwt_required()
def get_streak():
    user_id = get_jwt_identity()
    try:
        workouts = get_user_workouts(user_id)
        if not workouts:
            return jsonify({"streak": 0}), 200

        # Extract unique workout dates (just the date part)
        workout_dates = sorted(
            {w.date.date() for w in workouts},
            reverse=True
        )

        # Calculate streak
        streak = 0
        today = datetime.utcnow().date()
        for i, date in enumerate(workout_dates):
            if date == today - timedelta(days=streak):
                streak += 1
            else:
                break

        return jsonify({"streak": streak}), 200
    except Exception as e:
        print(f"[STREAK ERROR] {e}")
        return jsonify({"error": "Could not compute streak."}), 500

@workouts_bp.route('', methods=['POST'])
@jwt_required()
def create_workout():
    user_id = get_jwt_identity()
    data = request.get_json()
    workout_name = data.get('workout_name')
    exercises = data.get('exercises')

    if not workout_name or workout_name.strip() == '':
        logger.warning(f'Workout creation failed: Workout name is required for user {user_id}')
        return jsonify({'message': 'Workout name is required'}), 400

    if not exercises or not isinstance(exercises, list):
        logger.warning(f'Workout creation failed: Exercises must be provided as a list for user {user_id}')
        return jsonify({'message': 'Exercises must be provided as a list'}), 400

    # Generate a unique session_id to group this set of exercises.
    session_id = str(uuid.uuid4())

    try:
        for ex in exercises:
            exercise_name = ex.get('name')
            sets = ex.get('sets')
            reps = ex.get('reps')
            if not exercise_name or not str(sets).strip() or not str(reps).strip():
                logger.warning(
                    f'Workout creation failed: Each exercise must include valid name, sets, and reps for user {user_id}'
                )
                return jsonify({'message': 'Each exercise must include a name, sets, and reps'}), 400

            add_workout(user_id, workout_name, session_id, exercise_name, sets, reps, ex.get('weight', 0))
        logger.info(f"Workout session '{workout_name}' created successfully for user {user_id}")
        return jsonify({'message': 'Workout session created successfully'}), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f'Error creating workout session for user {user_id}: {e}')
        return jsonify({'message': 'Internal Server Error'}), 500


@workouts_bp.route('/<string:session_id>', methods=['PUT'])
@jwt_required()
def update_workout(session_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    workout_name = data.get('workout_name')
    exercises = data.get('exercises')

    if not workout_name or workout_name.strip() == '':
        logger.warning(f'Workout update failed: Workout name is required for user {user_id}')
        return jsonify({'message': 'Workout name is required'}), 400

    if not exercises or not isinstance(exercises, list):
        logger.warning(f'Workout update failed: Exercises must be provided as a list for user {user_id}')
        return jsonify({'message': 'Exercises must be provided as a list'}), 400

    try:
        update_workout_session(user_id, session_id, workout_name, exercises)
        logger.info(f"Workout session '{workout_name}' updated successfully for user {user_id}")
        return jsonify({'message': 'Workout session updated successfully'}), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f'Error updating workout session for user {user_id}: {e}')
        return jsonify({'message': 'Internal Server Error'}), 500


@workouts_bp.route('', methods=['GET'])
@jwt_required()
def get_workouts():
    user_id = get_jwt_identity()
    try:
        workouts = get_user_workouts(user_id)
        grouped_sessions = {}
        for w in workouts:
            if w.session_id not in grouped_sessions:
                grouped_sessions[w.session_id] = {
                    'session_id': w.session_id,
                    'workout_name': w.workout_name,
                    'date': w.date.strftime('%Y-%m-%d %H:%M:%S'),
                    'exercises': [],
                }
            grouped_sessions[w.session_id]['exercises'].append(
                {
                    'id': w.id,
                    'exercise': w.exercise,
                    'sets': w.sets,
                    'reps': w.reps,
                    'weight': w.weight,
                }
            )
        sessions = list(grouped_sessions.values())
        return jsonify(sessions), 200

    except Exception as e:
        logger.error(f'Error fetching workouts for user {user_id}: {e}')
        return jsonify({'message': 'Internal Server Error'}), 500


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
