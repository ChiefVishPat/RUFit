from app.dao.workout_dao import create_workout, delete_workouts_by_session, get_workouts_by_user, update_workout
from app.logging_config import logger


def add_workout(
    user_id: str, workout_name: str, session_id: str, exercise: str, sets: int, reps: int, weight: float = 0
):
    workout_data = {
        'user_id': user_id,
        'workout_name': workout_name,
        'session_id': session_id,
        'exercise': exercise,
        'sets': sets,
        'reps': reps,
        'weight': weight,
    }
    return create_workout(workout_data)


def update_workout_session(user_id: str, session_id: str, workout_name: str, exercises: list):
    """
    Updates a workout session by replacing all records under a given session.

    :param user_id: The ID of the user.
    :param session_id: The session ID grouping the workout session.
    :param workout_name: The name for the workout session.
    :param exercises: A list of dictionaries where each dict should have keys:
                      "name" (exercise name), "sets", "reps", and optionally "weight".
    """
    try:
        # Pass workout_name along with exercises to the DAO function.
        update_workout(session_id, user_id, workout_name, exercises)
        return True
    except Exception as e:
        logger.error(f'Error updating workout session for user {user_id}: {e}')
        raise e


def remove_workout_session(user_id: str, session_id: str):
    try:
        result = delete_workouts_by_session(user_id, session_id)
        return result
    except Exception as e:
        logger.error(f'Error deleting workout session {session_id} for user {user_id}: {e}')
        raise e


def get_user_workouts(user_id: str):
    try:
        return get_workouts_by_user(user_id)
    except Exception as e:
        logger.error(f'Error retrieving workouts for user {user_id}: {e}')
        raise e
