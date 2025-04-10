import uuid
from flask import Blueprint, request, jsonify
from app.models.workout import Workout
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.logging_config import logger

workouts_bp = Blueprint("workouts", __name__, url_prefix="/workout")


@workouts_bp.route("", methods=["POST"])
@jwt_required()
def create_workout():
    user_id = get_jwt_identity()
    data = request.get_json()
    workout_name = data.get("workout_name")
    exercises = data.get("exercises")

    if not workout_name:
        logger.warning(f"Workout creation failed: Workout name is required for user {user_id}")
        return jsonify({"message": "Workout name is required"}), 400

    if not exercises or not isinstance(exercises, list):
        logger.warning(f"Workout creation failed: Exercises must be provided as a list for user {user_id}")
        return jsonify({"message": "Exercises must be provided as a list"}), 400

    # Generate a unique session_id to group exercises
    session_id = str(uuid.uuid4())

    try:
        for ex in exercises:
            if not ex.get("name") or not ex.get("sets") or not ex.get("reps"):
                logger.warning(
                    f"Workout creation failed: Each exercise must include a name, sets, and reps for user {user_id}"
                )
                return jsonify({"message": "Each exercise must include a name, sets, and reps"}), 400

            new_workout = Workout(
                user_id=user_id,
                workout_name=workout_name,
                session_id=session_id,
                exercise=ex.get("name"),
                sets=ex.get("sets"),
                reps=ex.get("reps"),
                weight=ex.get("weight", 0),
            )
            db.session.add(new_workout)

        db.session.commit()
        logger.info(f"Workout session '{workout_name}' created successfully for user {user_id}")
        return jsonify({"message": "Workout session created successfully"}), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating workout session for user {user_id}: {e}")
        return jsonify({"message": "Internal Server Error"}), 500


@workouts_bp.route("/<string:session_id>", methods=["PUT"])
@jwt_required()
def update_workout(session_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    workout_name = data.get("workout_name")
    exercises = data.get("exercises")

    if not workout_name or not exercises or not isinstance(exercises, list):
        logger.warning(f"Workout update failed: Invalid input for user {user_id}")
        return jsonify({"message": "Invalid input: workout_name and exercises are required"}), 400

    try:
        # Delete existing workouts for the session
        existing_workouts = Workout.query.filter_by(session_id=session_id, user_id=user_id).all()
        if not existing_workouts:
            logger.warning(
                f"Workout update failed: No workout session found for session_id {session_id} and user {user_id}"
            )
            return jsonify({"message": "Workout session not found"}), 404

        for workout in existing_workouts:
            db.session.delete(workout)

        # Insert new rows with the same session_id
        for ex in exercises:
            if not ex.get("name") or not ex.get("sets") or not ex.get("reps"):
                logger.warning(
                    f"Workout update failed: Each exercise must include a name, sets, and reps for user {user_id}"
                )
                return jsonify({"message": "Each exercise must include a name, sets, and reps"}), 400

            new_workout = Workout(
                user_id=user_id,
                workout_name=workout_name,
                session_id=session_id,
                exercise=ex.get("name"),
                sets=ex.get("sets"),
                reps=ex.get("reps"),
                weight=ex.get("weight", 0),
            )
            db.session.add(new_workout)

        db.session.commit()
        logger.info(f"Workout session '{workout_name}' updated successfully for user {user_id}")
        return jsonify({"message": "Workout session updated successfully"}), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating workout session for user {user_id}: {e}")
        return jsonify({"message": "Internal Server Error"}), 500


@workouts_bp.route("", methods=["GET"])
@jwt_required()
def get_workouts():
    user_id = get_jwt_identity()
    try:
        workouts = Workout.query.filter_by(user_id=user_id).all()
        grouped_sessions = {}
        for w in workouts:
            if w.session_id not in grouped_sessions:
                grouped_sessions[w.session_id] = {
                    "session_id": w.session_id,
                    "workout_name": w.workout_name,
                    "date": w.date.strftime("%Y-%m-%d %H:%M:%S"),
                    "exercises": [],
                }
            grouped_sessions[w.session_id]["exercises"].append(
                {
                    "id": w.id,
                    "exercise": w.exercise,
                    "sets": w.sets,
                    "reps": w.reps,
                    "weight": w.weight,
                }
            )
        sessions = list(grouped_sessions.values())
        return jsonify(sessions), 200

    except Exception as e:
        logger.error(f"Error fetching workouts for user {user_id}: {e}")
        return jsonify({"message": "Internal Server Error"}), 500


@workouts_bp.route("/<int:workout_id>", methods=["DELETE"])
@jwt_required()
def delete_workout(workout_id):
    user_id = get_jwt_identity()
    try:
        workout = Workout.query.filter_by(id=workout_id, user_id=user_id).first()
        if not workout:
            logger.warning(f"Workout with id {workout_id} not found for user {user_id}")
            return jsonify({"message": "Workout not found"}), 404

        db.session.delete(workout)
        db.session.commit()
        logger.info(f"Workout with id {workout_id} deleted for user {user_id}")
        return jsonify({"message": "Workout removed!"}), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting workout with id {workout_id} for user {user_id}: {e}")
        return jsonify({"message": "Internal Server Error"}), 500
