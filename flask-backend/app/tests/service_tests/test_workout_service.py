import pytest
from app.services.workout_service import (
    add_workout,
    get_user_workouts,
    remove_workout_session,
    update_workout_session,
)


@pytest.fixture
def sample_exercises():
    """
    Provides a reusable list of exercise dicts for session‐update tests.
    Each dict includes the exercise name, number of sets, reps, and weight.
    """
    return [
        {'exercise': 'Squat', 'sets': 3, 'reps': 5, 'weight': 225},
        {'exercise': 'Bench', 'sets': 3, 'reps': 5, 'weight': 185},
    ]


def test_add_workout_calls_dao_create(mocker):
    """
    Verifies that add_workout() packages its inputs into a dict
    and calls create_workout() exactly once with that dict.
    """
    # Patch the DAO function where the service imported it
    mock_create = mocker.patch('app.services.workout_service.create_workout', return_value='NEW_WORKOUT')

    # Call the service function under test
    result = add_workout(
        user_id='user1',
        workout_name='Leg Day',
        session_id='sess123',
        exercise='Squat',
        sets=3,
        reps=5,
        weight=225,
    )

    # The service should return whatever create_workout() returned
    assert result == 'NEW_WORKOUT'

    # And create_workout() should have been called once with exactly this dict
    mock_create.assert_called_once_with(
        {
            'user_id': 'user1',
            'workout_name': 'Leg Day',
            'session_id': 'sess123',
            'exercise': 'Squat',
            'sets': 3,
            'reps': 5,
            'weight': 225,
        }
    )


def test_update_workout_session_success(mocker, sample_exercises):
    """
    Ensures update_workout_session() calls update_workout() with
    (session_id, user_id, workout_name, exercises) and returns True.
    """
    # Patch the DAO update function in the service module
    mock_update = mocker.patch('app.services.workout_service.update_workout', return_value=None)

    # Call the service function under test
    result = update_workout_session(
        user_id='user1',
        session_id='sess123',
        workout_name='Leg Day',
        exercises=sample_exercises,
    )

    # The service should translate a successful DAO call into True
    assert result is True

    # Verify that update_workout() was called exactly once with the correct args
    mock_update.assert_called_once_with(
        'sess123',  # session_id
        'user1',  # user_id
        'Leg Day',  # workout_name
        sample_exercises,  # exercises list
    )


def test_update_workout_session_propagates_exceptions(mocker, sample_exercises):
    """
    If update_workout() raises, update_workout_session() should let it bubble up.
    """
    # Make DAO update raise a RuntimeError
    err = RuntimeError('DAO failure')
    mocker.patch('app.services.workout_service.update_workout', side_effect=err)

    # Calling the service should re-raise that same error
    with pytest.raises(RuntimeError) as excinfo:
        update_workout_session(
            user_id='user1',
            session_id='sess123',
            workout_name='Leg Day',
            exercises=sample_exercises,
        )
    assert excinfo.value is err


def test_remove_workout_session_returns_true(mocker):
    """
    Ensures remove_workout_session() returns True when the DAO deletion returns True.
    """
    # Patch the DAO delete function in the service module
    mock_delete = mocker.patch('app.services.workout_service.delete_workouts_by_session', return_value=True)

    # Call the service function under test
    result = remove_workout_session(user_id='user1', session_id='sess123')

    # Should forward the DAO's True
    assert result is True

    # Verify it called delete_workouts_by_session(user_id, session_id)
    mock_delete.assert_called_once_with('user1', 'sess123')


def test_remove_workout_session_propagates_exceptions(mocker):
    """
    If delete_workouts_by_session() raises, the service should propagate the exception.
    """
    err = ValueError('Delete failed')
    mocker.patch('app.services.workout_service.delete_workouts_by_session', side_effect=err)

    with pytest.raises(ValueError) as excinfo:
        remove_workout_session(user_id='user1', session_id='sess123')
    assert excinfo.value is err


def test_get_user_workouts_calls_dao(mocker):
    """
    Verifies get_user_workouts() simply forwards the call to get_workouts_by_user()
    and returns its result.
    """
    # Patch the DAO fetch function in the service module
    mock_get = mocker.patch('app.services.workout_service.get_workouts_by_user', return_value=['W1', 'W2'])

    # Call the service function under test
    result = get_user_workouts(user_id='user1')

    # Should return exactly what the DAO returned
    assert result == ['W1', 'W2']

    # And should have called get_workouts_by_user('user1') once
    mock_get.assert_called_once_with('user1')
