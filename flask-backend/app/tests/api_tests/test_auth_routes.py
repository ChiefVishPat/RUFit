import pytest
from flask_jwt_extended import create_access_token


def test_register_missing_fields(client):
    # Passing an empty JSON ends up here:
    resp = client.post('/auth/register', json={})
    data = resp.get_json()
    assert resp.status_code == 400
    assert data['message'] == 'Username and password are required'


@pytest.mark.parametrize(
    'payload',
    [
        ({'username': 'alice'}),  # missing password
        ({'password': 'pw'}),  # missing username
    ],
)
def test_register_missing_username_or_password(client, payload):
    resp = client.post('/auth/register', json=payload)
    data = resp.get_json()
    assert resp.status_code == 400
    assert data['message'] == 'Username and password are required'


def test_register_success(client):
    payload = {'username': 'alice', 'password': 'secret', 'email': 'a@a.com'}
    resp = client.post('/auth/register', json=payload)
    assert resp.status_code == 201
    assert resp.get_json()['message'] == 'User registered successfully'


def test_register_duplicate_username(client):
    payload = {'username': 'bob', 'password': 'pw', 'email': 'b@b.com'}
    client.post('/auth/register', json=payload)
    resp = client.post('/auth/register', json={**payload, 'email': 'other@b.com'})
    assert resp.status_code == 400
    assert b'Username already exists' in resp.data


def test_register_duplicate_email(client):
    p1 = {'username': 'carol', 'password': 'pw', 'email': 'c@c.com'}
    client.post('/auth/register', json=p1)
    p2 = {'username': 'carol2', 'password': 'pw', 'email': 'c@c.com'}
    resp = client.post('/auth/register', json=p2)
    assert resp.status_code == 400
    assert b'Email already exists' in resp.data


def test_login_invalid(client):
    resp = client.post('/auth/login', json={'username': 'nope', 'password': 'wrong'})
    assert resp.status_code == 401


def test_login_success(client):
    client.post('/auth/register', json={'username': 'dave', 'password': 'pw', 'email': 'd@d.com'})
    resp = client.post('/auth/login', json={'username': 'dave', 'password': 'pw'})
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'access_token' in data and 'refresh_token' in data


def test_login_and_refresh(client):
    # refresh now returns 200 + new tokens
    client.post('/auth/register', json={'username': 'ellen', 'password': 'pw', 'email': 'e@e.com'})
    tok = client.post('/auth/login', json={'username': 'ellen', 'password': 'pw'}).get_json()['refresh_token']
    resp = client.post('/auth/refresh', headers={'Authorization': f'Bearer {tok}'})
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'access_token' in data and 'refresh_token' in data


def test_refresh_missing_token(client):
    resp = client.post('/auth/refresh')
    assert resp.status_code == 401


def test_refresh_with_invalid_token(client):
    resp = client.post('/auth/refresh', headers={'Authorization': 'Bearer badtoken'})
    assert resp.status_code == 422


def test_delete_account_unauthorized(client):
    resp = client.delete('/auth/account')
    assert resp.status_code == 401


def test_delete_account_not_found(client):
    token = create_access_token(identity='9999')
    resp = client.delete('/auth/account', headers={'Authorization': f'Bearer {token}'})
    assert resp.status_code == 404
    assert resp.get_json()['message'] == 'User not found'


def test_delete_account_success(client):
    client.post('/auth/register', json={'username': 'frank', 'password': 'pw', 'email': 'f@f.com'})
    tok = client.post('/auth/login', json={'username': 'frank', 'password': 'pw'}).get_json()['access_token']
    resp = client.delete('/auth/account', headers={'Authorization': f'Bearer {tok}'})
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['message'] == 'Account deleted successfully'
    # We still unset cookies on success
    assert 'Set-Cookie' in resp.headers


def test_token_expired_endpoint_missing_and_malformed(client):
    assert client.post('/auth/is-token-expired', json={}).status_code == 200


def test_is_token_expired_valid(client):
    client.post('/auth/register', json={'username': 'gina', 'password': 'pw', 'email': 'g@g.com'})
    tok = client.post('/auth/login', json={'username': 'gina', 'password': 'pw'}).get_json()['access_token']
    assert client.post('/auth/is-token-expired', json={'access_token': tok}).status_code == 200


def test_is_token_expired_nonexistent_user(client):
    tok = create_access_token(identity='12345')
    resp = client.post('/auth/is-token-expired', json={'access_token': tok})
    assert resp.status_code == 200
