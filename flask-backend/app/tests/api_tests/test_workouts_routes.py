from datetime import datetime

import pytest


@pytest.fixture
def auth_header(client):
    # register + login to get a token
    client.post('/auth/register', json={'username': 'u1', 'password': 'pw', 'email': 'u1@x.com'})
    res = client.post('/auth/login', json={'username': 'u1', 'password': 'pw'})
    token = res.get_json()['access_token']
    return {'Authorization': f'Bearer {token}'}


def test_create_workout_validation(client, auth_header):
    # no body
    resp = client.post('/workout', headers=auth_header, json={})
    assert resp.status_code == 400


def test_create_workout_success(client, auth_header, mocker):
    mocker.patch('app.routes.workouts.add_workout', return_value=None)
    payload = {'workout_name': 'Leg Day', 'exercises': [{'name': 'Squat', 'sets': 3, 'reps': 5}]}
    resp = client.post('/workout', headers=auth_header, json=payload)
    assert resp.status_code == 201
    assert resp.get_json()['message'].startswith('Workout session created')


def test_get_workouts(client, auth_header, mocker):
    fake = [
        # mimic the exact attributes the route uses:
        type(
            'W',
            (object,),
            {
                'session_id': 's1',
                'workout_name': 'A',
                'date': datetime(2025, 1, 1, 0, 0, 0),
                'id': 123,
                'exercise': 'Squat',
                'sets': 3,
                'reps': 5,
                'weight': 100,
            },
        )()
    ]
    mocker.patch('app.routes.workouts.get_user_workouts', return_value=fake)
    resp = client.get('/workout', headers=auth_header)
    assert resp.status_code == 200
    data = resp.get_json()
    assert isinstance(data, list)
    assert data[0]['session_id'] == 's1'


def test_update_workout_validation(client, auth_header):
    # missing session_id
    resp = client.put('/workout/s2', headers=auth_header, json={'workout_name': 'X', 'exercises': []})
    assert resp.status_code == 400


def test_update_workout_success(client, auth_header, mocker):
    mocker.patch('app.routes.workouts.update_workout_session', return_value=True)
    payload = {'session_id': 's2', 'workout_name': 'Push Day', 'exercises': [{'name': 'Bench', 'sets': 3, 'reps': 8}]}
    resp = client.put('/workout/s2', headers=auth_header, json=payload)
    assert resp.status_code == 200
    assert 'updated successfully' in resp.get_json()['message']


def test_delete_workout_not_found(client, auth_header, mocker):
    mocker.patch('app.routes.workouts.remove_workout_session', return_value=False)
    resp = client.delete('/workout/s_not_exist', headers=auth_header)
    assert resp.status_code == 404


def test_delete_workout_success(client, auth_header, mocker):
    mocker.patch('app.routes.workouts.remove_workout_session', return_value=True)
    resp = client.delete('/workout/s1', headers=auth_header)
    assert resp.status_code == 200
    assert 'removed' in resp.get_json()['message']
