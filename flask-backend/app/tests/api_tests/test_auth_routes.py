import pytest


def test_register_missing_fields(client):
    resp = client.post('/auth/register', json={})
    assert resp.status_code == 400
    assert b'Username and password are required' in resp.data


def test_register_success(client):
    payload = {'username': 'alice', 'password': 'secret', 'email': 'a@a.com'}
    resp = client.post('/auth/register', json=payload)
    assert resp.status_code == 201
    assert resp.get_json()['message'] == 'User registered successfully'


def test_register_duplicate_username(client):
    payload = {'username': 'bob', 'password': 'pw', 'email': 'b@b.com'}
    client.post('/auth/register', json=payload)
    # same username again
    resp = client.post('/auth/register', json={**payload, 'email': 'other@b.com'})
    assert resp.status_code == 400
    assert b'Username already exists' in resp.data


def test_login_invalid(client):
    resp = client.post('/auth/login', json={'username': 'nope', 'password': 'wrong'})
    assert resp.status_code == 401


def test_login_and_refresh(client):
    # register first
    client.post('/auth/register', json={'username': 'carol', 'password': 'pw', 'email': 'c@c.com'})
    login_resp = client.post('/auth/login', json={'username': 'carol', 'password': 'pw'})
    assert login_resp.status_code == 200
    data = login_resp.get_json()
    assert 'access_token' in data and 'refresh_token' in data

    # refresh
    refresh_resp = client.post('/auth/refresh', headers={'Authorization': f'Bearer {data["refresh_token"]}'})
    assert refresh_resp.status_code == 200
    assert 'access_token' in refresh_resp.get_json()


def test_token_expired_endpoint(client):
    # no token
    resp = client.post('/auth/is-token-expired', json={})
    assert resp.status_code == 400
    # malformed
    resp2 = client.post('/auth/is-token-expired', json={'access_token': 'bad'})
    assert resp2.status_code == 200
    assert resp2.get_json()['expired'] is True
