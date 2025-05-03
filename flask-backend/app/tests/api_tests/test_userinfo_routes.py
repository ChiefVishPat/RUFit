import pytest
from app.logging_config import logger
from app.tools.enums.userinfoEnums import (
    GenderChoices,
    HeightUnits,
    TrainingGoals,
    TrainingIntensityLevels,
    WeightUnits,
)


def test_post_userinfo_validation(client, auth_header):
    resp = client.post('/userinfo', headers=auth_header, json={})
    assert resp.status_code == 400


def test_post_userinfo_success(client, auth_header, mocker):
    mocker.patch('app.services.userinfo_service.add_or_update_userinfo', return_value=None)
    payload = {
        'user_data': {
            'gender': 'Male',
            'weight': 150,
            'weightUnit': 'lb',
            'heightValue1': 5,
            'heightValue2': 10,
            'heightUnit': 'US',
            'trainingIntensity': 'Moderate',
            'goal': 'Maintain',
        }
    }
    resp = client.post('/userinfo', headers=auth_header, json=payload)
    assert resp.status_code == 201


def test_get_userinfo_not_found(client, auth_header, mocker):
    mocker.patch('app.routes.userinfo.fetch_userinfo', side_effect=ValueError('User info not found'))
    resp = client.get('/userinfo', headers=auth_header)
    assert resp.status_code == 404
    assert resp.get_json()['message'] == 'User info not found'


def test_get_userinfo_success(client, auth_header, mocker):
    fake_user = mocker.Mock(username='u2', email='u2@x.com')
    fake_userinfo = mocker.Mock(
        user=fake_user,
        gender=GenderChoices.FEMALE,
        weight=150,
        weight_unit=WeightUnits.LB,
        height_ft=5,
        height_in=10,
        height_unit=HeightUnits.US,
        training_intensity=TrainingIntensityLevels.AMATEUR,
        goal=TrainingGoals.SURPLUS,
        streak_goal=5,
    )
    mocker.patch('app.routes.userinfo.fetch_userinfo', return_value=fake_userinfo)
    resp = client.get('/userinfo', headers=auth_header)
    data = resp.get_json()
    assert resp.status_code == 200
    assert data['username'] == 'u2'
    assert data['email'] == 'u2@x.com'
    assert data['gender'] == GenderChoices.FEMALE.value
    assert data['weight'] == 150
    assert data['weight_unit'] == WeightUnits.LB.value
    assert data['height_ft'] == 5
    assert data['height_in'] == 10
    assert data['height_unit'] == HeightUnits.US.value
    assert data['training_intensity'] == TrainingIntensityLevels.AMATEUR.value
    assert data['goal'] == TrainingGoals.SURPLUS.value
    assert data['streak_goal'] == 5
