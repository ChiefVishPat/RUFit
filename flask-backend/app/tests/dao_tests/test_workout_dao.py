import pytest
from app.dao.workout_dao import (
    create_workout,
    delete_workouts_by_session,
    get_workouts_by_session,
    get_workouts_by_user,
    update_workout,
)
from app.extensions import db
from app.models.users import User
from app.models.workout import Workout


@pytest.mark.usefixtures('db')
class TestWorkoutDAO:
    def test_create_and_fetch_workouts(self):
        user = User(username='user1', email='user1@example.com', password='pw')
        db.session.add(user)
        db.session.commit()
        uid = user.id
        session_id = 'sess1'
        workout_data = {
            'user_id': uid,
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
        # fetch by user (must pass the integer ID)
        all_for_user = get_workouts_by_user(uid)
        assert len(all_for_user) == 1
        assert all_for_user[0].id == new.id

        # fetch by session (also using integer ID)
        session_ws = get_workouts_by_session(uid, session_id)
        assert len(session_ws) == 1
        assert session_ws[0].exercise == 'Squat'

    def test_update_workout(self):
        # 1) create & commit a user
        user = User(username='user2', email='user2@example.com', password='pw')
        db.session.add(user)
        db.session.commit()
        uid = user.id

        session_id = 'sess2'
        # 2) seed one row
        create_workout(
            {
                'user_id': uid,
                'workout_name': 'Arm Day',
                'session_id': session_id,
                'exercise': 'Curl',
                'sets': 2,
                'reps': 10,
                'weight': 25.0,
            }
        )

        # 3) prepare the update using the DAO's expected keys:
        new_session_name = 'Arm Day Updated'
        new_exercises = [
            {'name': 'Tricep Dip', 'sets': 3, 'reps': 12},  # weight defaults to 0
            {'name': 'Hammer Curl', 'sets': 3, 'reps': 10, 'weight': 20},
        ]

        # 4) call update_workout exactly as the DAO expects:
        result = update_workout(session_id, uid, new_session_name, new_exercises)
        assert result is True

        # 5) verify it really replaced the old row with two new ones
        ws = get_workouts_by_session(uid, session_id)
        assert len(ws) == 2
        assert all(w.workout_name == new_session_name for w in ws)
        assert {w.exercise for w in ws} == {'Tricep Dip', 'Hammer Curl'}

    def test_delete_workouts_by_session(self):
        user = User(username='user3', email='user3@example.com', password='pw')
        db.session.add(user)
        db.session.commit()
        uid = user.id

        session_id = 'sess3'
        create_workout(
            {
                'user_id': user.id,
                'workout_name': 'Test',
                'session_id': session_id,
                'exercise': 'Test Ex',
                'sets': 1,
                'reps': 1,
            }
        )
        # confirm it exists
        assert get_workouts_by_session(uid, session_id)
        # delete
        deleted = delete_workouts_by_session(uid, session_id)
        assert deleted is True
        # now gone
        assert get_workouts_by_session(uid, session_id) == []
        # deleting again returns False
        assert delete_workouts_by_session(uid, 'nope') is False
