import pytest
from app.dao.userinfo_dao import (
    create_userinfo,
    get_userinfo_by_user,
    update_userinfo,
)
from app.models.userinfo import Userinfo


@pytest.mark.usefixtures('db')
class TestUserinfoDAO:
    def test_create_and_fetch_userinfo(self):
        user_id = 'u1'
        payload = {
            'user_id': user_id,
            'experience': 'Beginner',
            'goal': 'Maintain',
            'age': 25,
            'weight': 150,
            'height_ft': 5,
            'height_in': 8,
            'gender': 'Female',
        }

        record = create_userinfo(payload)
        assert isinstance(record, Userinfo)
        assert record.id is not None

        fetched = get_userinfo_by_user(user_id)
        assert fetched.id == record.id
        assert fetched.weight == 150
        assert fetched.gender == 'Female'

    def test_update_userinfo(self):
        user_id = 'u2'
        initial = {
            'user_id': user_id,
            'experience': 'Intermediate',
            'goal': 'Surplus',
            'age': 30,
            'weight': 170,
            'height_ft': 6,
            'height_in': 1,
            'gender': 'Male',
        }
        create_userinfo(initial)

        # update weight and age
        update_payload = {'age': 31, 'weight': 175}
        update_userinfo(user_id, update_payload)

        updated = get_userinfo_by_user(user_id)
        assert updated.age == 31
        assert updated.weight == 175

    # in case we ever implement user deletion
    # def test_delete_userinfo(self):
    #     user_id = "u3"
    #     payload = {
    #         "user_id": user_id,
    #         "experience": "Advanced",
    #         "goal": "Deficit",
    #         "age": 40,
    #         "weight": 160,
    #         "height_ft": 5,
    #         "height_in": 6,
    #         "gender": "Other",
    #     }
    #     create_userinfo(payload)
    #     assert get_userinfo_by_user(user_id) is not None

    #     deleted = delete_userinfo_by_user(user_id)
    #     assert deleted is True
    #     assert get_userinfo_by_user(user_id) is None
