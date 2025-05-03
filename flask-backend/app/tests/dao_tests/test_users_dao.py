import pytest
from app.dao.users_dao import (
    create_user,
    get_user_by_email,
    get_user_by_username,
)
from app.extensions import db
from app.models.users import User


@pytest.mark.usefixtures('db')
class TestUsersDAO:
    def test_get_user_by_username_returns_user_when_exists(self):
        # seed
        u = User(username='foo', email='foo@x.com', password='pw')
        db.session.add(u)
        db.session.commit()
        found = get_user_by_username('foo')
        assert isinstance(found, User)
        assert found.username == 'foo'

    def test_get_user_by_username_returns_none_when_missing(self):
        assert get_user_by_username('nope') is None

    def test_get_user_by_email_returns_user_when_exists(self):
        u = User(username='bar', email='bar@x.com', password='pw')
        db.session.add(u)
        db.session.commit()
        found = get_user_by_email('bar@x.com')
        assert found.email == 'bar@x.com'

    def test_get_user_by_email_returns_none_when_missing(self):
        assert get_user_by_email('none@x.com') is None

    def test_create_user_persists_and_returns_model(self):
        new = create_user('jub', 'secret', 'jub@x.com')
        assert isinstance(new, User)
        assert new.id is not None
        # double‑check in DB
        from app.dao.users_dao import get_user_by_username

        assert get_user_by_username('jub').email == 'jub@x.com'
