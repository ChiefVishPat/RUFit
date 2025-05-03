import pytest
from app import create_app
from app import db as _db
from app.config import TestingConfig


@pytest.fixture(scope='session')
def app():
    """
    Create and configure a new app instance for the entire test session
    using TestingConfig (which uses an in-memory SQLite DB).
    """
    app = create_app(TestingConfig)
    with app.app_context():
        yield app


@pytest.fixture(scope='session')
def db(app):
    """
    Create all tables once, then drop them at session end.
    """
    with app.app_context():
        _db.create_all()
        yield _db
        _db.drop_all()


@pytest.fixture(autouse=True)
def clean_db(db):
    """
    Before each test, rollback any open transaction and truncate all tables.
    After each test, do the same cleanup again.
    This ensures each test starts (and ends) with a completely empty DB.
    """
    # ---- before test ----
    _db.session.rollback()
    for table in reversed(_db.metadata.sorted_tables):
        _db.session.execute(table.delete())
    _db.session.commit()

    yield

    # ---- after test ----
    _db.session.rollback()
    for table in reversed(_db.metadata.sorted_tables):
        _db.session.execute(table.delete())
    _db.session.commit()


@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()


@pytest.fixture
def auth_header(client):
    """
    Register & log in a dummy user; return a header with a valid bearer token.
    """
    client.post(
        '/auth/register',
        json={'username': 'test', 'password': 'pw', 'email': 't@t.com'},
    )
    token = client.post(
        '/auth/login',
        json={'username': 'test', 'password': 'pw'},
    ).get_json()['access_token']
    return {'Authorization': f'Bearer {token}'}
