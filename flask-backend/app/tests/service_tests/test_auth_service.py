import pytest
from app.services.auth_service import delete_account, login_user, register_user


@pytest.fixture(autouse=True)
def noop_db_rollback(mocker):
    # prevent real DB rollbacks during error paths
    mocker.patch('app.services.auth_service.db.session.rollback', return_value=None)


def test_register_user_success(mocker):
    # no existing username/email
    mocker.patch('app.services.auth_service.get_user_by_username', return_value=None)
    mocker.patch('app.services.auth_service.get_user_by_email', return_value=None)
    # pretend DAO.create_user returns a User-like object with an .id
    FakeUser = type('U', (), {'id': 42})
    mocker.patch('app.services.auth_service.create_user', return_value=FakeUser())

    user, err = register_user('charlie', 'pwd', 'charlie@example.com')
    assert isinstance(user, FakeUser.__class__) or hasattr(user, 'id')
    assert err is None


def test_register_user_conflict_username(mocker):
    # username already exists
    mocker.patch('app.services.auth_service.get_user_by_username', return_value='exists')
    user, err = register_user('charlie', 'pwd', 'charlie@example.com')
    assert user is None
    assert err == 'Username already exists'


def test_register_user_conflict_email(mocker):
    # email already exists
    mocker.patch('app.services.auth_service.get_user_by_username', return_value=None)
    mocker.patch('app.services.auth_service.get_user_by_email', return_value='exists')
    user, err = register_user('charlie', 'pwd', 'charlie@example.com')
    assert user is None
    assert err == 'Email already exists'


def test_login_user_success(mocker):
    # stub username lookup in the service namespace (lazy import shadow)
    FakeUser = type('U', (), {'id': 42, 'password_hash': 'hashed'})
    mocker.patch('app.services.auth_service.get_user_by_username', return_value=FakeUser())

    # bcrypt.check → True
    class B:
        check_password_hash = staticmethod(lambda h, p: True)

    mocker.patch('app.services.auth_service.bcrypt', B)
    # stub token creation
    mocker.patch('app.services.auth_service.create_access_token', lambda identity: 'AT' + identity)
    mocker.patch('app.services.auth_service.create_refresh_token', lambda identity: 'RT' + identity)

    tokens, err = login_user('charlie', 'pwd')
    assert err is None
    assert tokens == {'access_token': 'AT42', 'refresh_token': 'RT42'}


def test_login_user_invalid(mocker):
    # no such user or bad password
    mocker.patch('app.dao.users_dao.get_user_by_username', return_value=None)
    tokens, err = login_user('charlie', 'wrong')
    assert tokens is None
    assert err == 'Invalid credentials'


def test_delete_account_success(mocker):
    # delete_user_by_id returns True
    mocker.patch('app.services.auth_service.delete_user_by_id', return_value=True)
    assert delete_account(123) is True


def test_delete_account_failure(mocker):
    # delete_user_by_id returns False
    mocker.patch('app.services.auth_service.delete_user_by_id', return_value=False)
    assert delete_account(123) is False
