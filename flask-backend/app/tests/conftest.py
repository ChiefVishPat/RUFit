import pytest
from app import create_app
from app import db as _db
from app.config import TestingConfig


@pytest.fixture(scope='session')
def app():
    """
    Create and configure a new app instance for the entire test session
    using TestingConfig (which uses an in‑memory SQLite DB).
    """
    app = create_app(TestingConfig)
    with app.app_context():
        yield app


@pytest.fixture(scope='session')
def db(app):
    """
    Yield the SQLAlchemy object registered in create_app.
    Tables are created/dropped per-test by clean_db.
    """
    yield _db


@pytest.fixture(autouse=True)
def clean_db(app, db):
    """
    Drop & recreate all tables around each test, then remove session.
    """
    _db.drop_all()
    _db.create_all()
    yield
    _db.session.remove()


@pytest.fixture
def client(app):
    """
    Provide a Flask test client for all API tests.
    """
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
