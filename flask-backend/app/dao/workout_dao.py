from app.extensions import db
from app.logging_config import logger
from app.models.workout import Workout
from sqlalchemy import desc

def get_workouts_by_user(user_id: str):
    try:
        return Workout.query.filter_by(user_id=user_id).all()
    except Exception as e:
        logger.error(f"Error fetching workouts for user '{user_id}': {e}")
        raise


def get_workouts_by_session(user_id: str, session_id: str):
    try:
        return Workout.query.filter_by(user_id=user_id, session_id=session_id).all()
    except Exception as e:
        logger.error(f"Error fetching workouts for session '{session_id}' and user '{user_id}': {e}")
        raise
    
def get_workouts_by_user_and_exercise(user_id: str, exercise_name: str, limit: int = None):
    """
    Fetches workout history for a specific user and exercise, ordered by date descending.

    :param user_id: The user's ID.
    :param exercise_name: The name of the exercise.
    :param limit: Optional limit on the number of sessions to retrieve.
    :return: A list of Workout objects.
    """
    try:
        query = Workout.query.filter_by(user_id=user_id, exercise=exercise_name).order_by(desc(Workout.date))
        if limit:
            return query.limit(limit).all()
        return query.all()
    except Exception as e:
        logger.error(f"Error fetching workouts for user '{user_id}' and exercise '{exercise_name}': {e}")
        raise


def create_workout(workout_data: dict):
    """
    Expects workout_data to have keys: user_id, workout_name, session_id, exercise, sets, reps, and weight (optional).
    """
    try:
        new_workout = Workout(
            user_id=workout_data.get('user_id'),
            workout_name=workout_data.get('workout_name'),
            session_id=workout_data.get('session_id'),
            exercise=workout_data.get('exercise'),
            sets=workout_data.get('sets'),
            reps=workout_data.get('reps'),
            weight=workout_data.get('weight', 0),
        )
        db.session.add(new_workout)
        db.session.commit()
        logger.info(
            f"Workout created for user '{workout_data.get('user_id')}' in session '{workout_data.get('session_id')}'"
        )
        return new_workout
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating workout for user '{workout_data.get('user_id')}': {e}")
        raise


def update_workout(session_id: str, user_id: str, workout_name: str, exercises: list):
    """
    Updates a workout session by removing all existing records for the session and inserting the new ones.

    :param session_id: Unique identifier for the workout session.
    :param user_id: The user's ID.
    :param workout_name: The name for the workout session (applied to all records).
    :param exercises: A list of dictionaries. Each should have:
                      - "name": the exercise name,
                      - "sets": the number of sets,
                      - "reps": the number of reps,
                      - "weight": the weight (optional, defaults to 0 if not provided).
    """
    try:
        # Delete existing workouts for the session.
        existing_workouts = Workout.query.filter_by(user_id=user_id, session_id=session_id).all()
        if not existing_workouts:
            logger.warning(f"No workouts found for session '{session_id}' and user '{user_id}'")
            return None

        for w in existing_workouts:
            db.session.delete(w)

        # Insert new workout records.
        for exercise in exercises:
            exercise_name = exercise.get('name')
            sets = exercise.get('sets')
            reps = exercise.get('reps')
            weight = exercise.get('weight', 0)

            # Validate that required fields are provided.
            if not exercise_name or not sets or not reps:
                logger.warning(f"Missing exercise details for user '{user_id}' in session '{session_id}'")
                return None

            new_workout = Workout(
                user_id=user_id,
                workout_name=workout_name,  # use the top-level workout name for all records
                session_id=session_id,
                exercise=exercise_name,  # map 'name' from frontend to 'exercise'
                sets=sets,
                reps=reps,
                weight=weight,
            )
            db.session.add(new_workout)

        db.session.commit()
        logger.info(f"Workout session '{session_id}' updated for user '{user_id}'")
        return True

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating workout session '{session_id}' for user '{user_id}': {e}")
        raise


def delete_workouts_by_session(user_id: str, session_id: str):
    """
    Deletes all workout records for the given user that belong to the specified session_id.
    """
    try:
        workouts = Workout.query.filter_by(user_id=user_id, session_id=session_id).all()
        if not workouts:
            logger.warning(f"No workouts found for session '{session_id}' and user '{user_id}'")
            return False
        for workout in workouts:
            db.session.delete(workout)
        db.session.commit()
        logger.info(f"Workout session '{session_id}' deleted successfully for user '{user_id}'")
        return True
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting workout session '{session_id}' for user '{user_id}': {e}")
        raise
