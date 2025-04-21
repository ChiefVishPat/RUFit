import pytest
from app.dao.workout_dao import (
    create_workout,
    delete_workouts_by_session,
    get_workouts_by_session,
    get_workouts_by_user,
    update_workout,
)
from app.models.workout import Workout


@pytest.mark.usefixtures('db')
class TestWorkoutDAO:
    def test_create_and_fetch_workouts(self):
        user_id = 'user1'
        session_id = 'sess1'
        workout_data = {
            'user_id': user_id,
            'workout_name': 'Leg Day',
            'session_id': session_id,
            'exercise': 'Squat',
            'sets': 3,
            'reps': 8,
            'weight': 185.0,
        }

        new = create_workout(workout_data)
        # persisted
        assert isinstance(new, Workout)
        assert new.id is not None
        # fetch by user
        all_for_user = get_workouts_by_user(user_id)
        assert len(all_for_user) == 1
        assert all_for_user[0].id == new.id
        # fetch by session
        session_ws = get_workouts_by_session(user_id, session_id)
        assert len(session_ws) == 1
        assert session_ws[0].exercise == 'Squat'

    def test_update_workout(self):
        user_id = 'user2'
        session_id = 'sess2'
        # seed one row
        create_workout(
            {
                'user_id': user_id,
                'workout_name': 'Arm Day',
                'session_id': session_id,
                'exercise': 'Curl',
                'sets': 2,
                'reps': 10,
                'weight': 25.0,
            }
        )
        # update: replace with two exercises
        new_exercises = [
            {'workout_name': 'Arm Day Updated', 'exercise': 'Tricep Dip', 'sets': 3, 'reps': 12},
            {'workout_name': 'Arm Day Updated', 'exercise': 'Hammer Curl', 'sets': 3, 'reps': 10, 'weight': 20.0},
        ]
        # returns None on success
        update_workout(session_id, user_id, new_exercises)

        ws = get_workouts_by_session(user_id, session_id)
        assert len(ws) == 2
        assert all(w.workout_name == 'Arm Day Updated' for w in ws)
        assert set(w.exercise for w in ws) == {'Tricep Dip', 'Hammer Curl'}

    def test_delete_workouts_by_session(self):
        user_id = 'user3'
        session_id = 'sess3'
        create_workout(
            {
                'user_id': user_id,
                'workout_name': 'Test',
                'session_id': session_id,
                'exercise': 'Test Ex',
                'sets': 1,
                'reps': 1,
            }
        )
        # confirm it exists
        assert get_workouts_by_session(user_id, session_id)
        # delete
        deleted = delete_workouts_by_session(user_id, session_id)
        assert deleted is True
        # now gone
        assert get_workouts_by_session(user_id, session_id) == []
        # deleting again returns False
        assert delete_workouts_by_session(user_id, 'nope') is False
