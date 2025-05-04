import datetime

import pytest
from app.dao.macro_tracker_dao import (
    commit_changes,
    delete_tracker,
    get_tracker_by_id,
    get_tracker_records,
    insert_tracker,
)
from app.extensions import db
from app.models.macro_tracker import Tracker
from app.models.users import User


@pytest.mark.usefixtures('db')
class TestMacroTrackerDAO:
    def _make_user(self, username='testuser', email='test@example.com'):
        """Helper to create and persist a user, returning its id."""
        u = User(username=username, password='pw', email=email)
        db.session.add(u)
        db.session.commit()
        return u.id

    def test_insert_and_get_records_ordering(self):
        # create a user so tracker.user_id FK is valid
        uid = self._make_user('user1', 'u1@x.com')

        today = datetime.date.today()
        yesterday = today - datetime.timedelta(days=1)

        # insert yesterday's record
        rec1 = Tracker(
            user_id=uid,
            date=yesterday,
            food_name='Yest Food',
            calories=50,
            protein=5,
            carbs=10,
            fiber=2,
            unsat_fat=1,
            sat_fat=0,
        )
        db.session.add(rec1)
        commit_changes()

        # insert today's record
        rec2 = Tracker(
            user_id=uid,
            date=today,
            food_name='Today Food',
            calories=60,
            protein=6,
            carbs=12,
            fiber=3,
            unsat_fat=2,
            sat_fat=1,
        )
        db.session.add(rec2)
        commit_changes()

        # when no date filter, get_tracker_records should return [today, yesterday]
        records = get_tracker_records(uid)
        assert [r.date for r in records] == [today, yesterday]

    def test_get_records_by_date(self):
        uid = self._make_user('user2', 'u2@x.com')

        today = datetime.date.today()
        other_day = today - datetime.timedelta(days=2)

        # insert two records on different dates
        for d, name in [(today, 'A'), (other_day, 'B')]:
            rec = Tracker(
                user_id=uid,
                date=d,
                food_name=name,
                calories=20,
                protein=2,
                carbs=5,
                fiber=1,
                unsat_fat=0,
                sat_fat=0,
            )
            db.session.add(rec)
        commit_changes()

        # filter by today
        today_records = get_tracker_records(uid, date=today)
        assert len(today_records) == 1
        assert today_records[0].food_name == 'A'

    def test_get_tracker_by_id(self):
        uid = self._make_user('user3', 'u3@x.com')

        today = datetime.date.today()

        rec = Tracker(
            user_id=uid,
            date=today,
            food_name='Test Food',
            calories=75,
            protein=7,
            carbs=15,
            fiber=3,
            unsat_fat=1,
            sat_fat=1,
        )
        db.session.add(rec)
        commit_changes()

        found = get_tracker_by_id(uid, rec.id)
        assert found is not None
        assert found.food_name == 'Test Food'

    def test_delete_tracker(self):
        uid = self._make_user('user4', 'u4@x.com')

        today = datetime.date.today()

        rec = Tracker(
            user_id=uid,
            date=today,
            food_name='ToDelete',
            calories=10,
            protein=1,
            carbs=2,
            fiber=0,
            unsat_fat=0,
            sat_fat=0,
        )
        db.session.add(rec)
        commit_changes()

        delete_tracker(rec)
        commit_changes()
        assert get_tracker_by_id(uid, rec.id) is None
