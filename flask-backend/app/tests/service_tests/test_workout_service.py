import pytest
from app.services.workout_service import (
    add_workout,
    get_user_workouts,
    remove_workout_session,
    update_workout_session,
)


@pytest.fixture
def sample_exercises():
    return [
        {'exercise': 'Squat', 'sets': 3, 'reps': 5, 'weight': 225},
        {'exercise': 'Bench', 'sets': 3, 'reps': 5, 'weight': 185},
    ]


def test_add_workout_calls_dao_create(mocker, sample_exercises):
    mock_create = mocker.patch(
        'app.dao.workout_dao.create_workout',
        return_value='NEW_WORKOUT',
    )
    result = add_workout(
        user_id='user1',
        workout_name='Leg Day',
        session_id='sess123',
        exercise='Squat',
        sets=3,
        reps=5,
        weight=225,
    )
    assert result == 'NEW_WORKOUT'
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
    mock_update = mocker.patch('app.dao.workout_dao.update_workout', return_value=None)
    result = update_workout_session('user1', 'sess123', 'Leg Day', sample_exercises)
    assert result is True
    mock_update.assert_called_once_with('sess123', 'user1', sample_exercises)


def test_update_workout_session_propagates_exceptions(mocker):
    err = RuntimeError('DAO failure')
    mock_update = mocker.patch('app.dao.workout_dao.update_workout', side_effect=err)
    with pytest.raises(RuntimeError) as excinfo:
        update_workout_session('user1', 'sess123', 'Leg Day', [])
    assert excinfo.value is err


def test_remove_workout_session_returns_true(mocker):
    mock_delete = mocker.patch(
        'app.dao.workout_dao.delete_workouts_by_session',
        return_value=True,
    )
    result = remove_workout_session('user1', 'sess123')
    assert result is True
    mock_delete.assert_called_once_with('user1', 'sess123')


def test_remove_workout_session_propagates_exceptions(mocker):
    err = ValueError('Delete failed')
    mock_delete = mocker.patch('app.dao.workout_dao.delete_workouts_by_session', side_effect=err)
    with pytest.raises(ValueError):
        remove_workout_session('user1', 'sess123')


def test_get_user_workouts_calls_dao(mocker):
    mock_get = mocker.patch(
        'app.dao.workout_dao.get_workouts_by_user',
        return_value=['W1', 'W2'],
    )
    result = get_user_workouts('user1')
    assert result == ['W1', 'W2']
    mock_get.assert_called_once_with('user1')
