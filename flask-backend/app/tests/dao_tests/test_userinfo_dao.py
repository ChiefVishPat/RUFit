import pytest
from app.dao.userinfo_dao import (
    create_userinfo,
    get_userinfo_by_user,
    update_userinfo,
)
from app.extensions import db
from app.models.userinfo import Userinfo
from app.models.users import User
from app.tools.enums.userinfoEnums import (
    GenderChoices,
    HeightUnits,
    TrainingGoals,
    TrainingIntensityLevels,
    WeightUnits,
)


@pytest.mark.usefixtures('db')
class TestUserinfoDAO:
    def test_create_and_fetch_userinfo(self):
        user = User(username='u1', email='u1@example.com', password='pw')
        db.session.add(user)
        db.session.commit()
        uid = user.id

        payload = {
            'gender': GenderChoices.FEMALE.value,
            'weight': 150,
            'weightUnit': WeightUnits.LB.value,
            'heightValue1': 5,
            'heightValue2': 8,
            'heightUnit': HeightUnits.US.value,
            'trainingIntensity': TrainingIntensityLevels.AMATEUR.value,
            'goal': TrainingGoals.SURPLUS.value,
            'streak_goal': 0,
        }

        record = create_userinfo(uid, payload)
        assert isinstance(record, Userinfo)
        assert record.id is not None

        fetched = get_userinfo_by_user(uid)
        assert fetched.id == record.id
        assert fetched.weight == 150
        assert fetched.gender == GenderChoices.FEMALE

    def test_update_userinfo(self):
        user = User(username='u2', email='u2@example.com', password='pw')
        db.session.add(user)
        db.session.commit()
        uid = user.id
        initial = {
            'gender': GenderChoices.FEMALE.value,
            'weight': 150,
            'weightUnit': WeightUnits.LB.value,
            'heightValue1': 5,
            'heightValue2': 8,
            'heightUnit': HeightUnits.US.value,
            'trainingIntensity': TrainingIntensityLevels.AMATEUR.value,
            'goal': TrainingGoals.SURPLUS.value,
            'streak_goal': 0,
        }
        create_userinfo(uid, initial)

        # update weight and age
        update_payload = {'training_intensity': TrainingIntensityLevels.EXPERIENCED.value, 'weight': 175}
        update_userinfo(uid, update_payload)

        updated = get_userinfo_by_user(uid)
        assert updated.training_intensity == TrainingIntensityLevels.EXPERIENCED
        assert updated.weight == 175
