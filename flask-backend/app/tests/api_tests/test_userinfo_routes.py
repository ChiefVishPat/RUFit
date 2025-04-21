import pytest


@pytest.fixture
def auth_header(client):
    client.post('/auth/register', json={'username': 'u2', 'password': 'pw', 'email': 'u2@x.com'})
    token = client.post('/auth/login', json={'username': 'u2', 'password': 'pw'}).get_json()['access_token']
    return {'Authorization': f'Bearer {token}'}


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
    mocker.patch('app.services.userinfo_service.fetch_userinfo', side_effect=ValueError('not found'))
    resp = client.get('/userinfo', headers=auth_header)
    assert resp.status_code == 404


def test_get_userinfo_success(client, auth_header, mocker):
    fake = {
        'username': 'u2',
        'email': 'u2@x.com',
        'gender': 'Male',
        'weight': 150,
        'weight_unit': 'lb',
        'height_ft': 5,
        'height_in': 10,
        'height_unit': 'US',
        'training_intensity': 'Moderate',
        'goal': 'Maintain',
    }
    mocker.patch('app.services.userinfo_service.fetch_userinfo', return_value=fake)
    resp = client.get('/userinfo', headers=auth_header)
    assert resp.status_code == 200
    assert resp.get_json()['username'] == 'u2'
