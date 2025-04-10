from flask_jwt_extended import create_access_token, create_refresh_token

from app.dao.users_dao import create_user, get_user_by_email, get_user_by_username
from app.extensions import bcrypt, db


def register_user(username: str, password: str, email: str):
    # Check if user already exists
    if get_user_by_username(username):
        return None, 'Username already exists'
    if get_user_by_email(email):
        return None, 'Email already exists'
    try:
        user = create_user(username, password, email)
        return user, None
    except Exception as e:
        db.session.rollback()
        # Propagate the error to be handled by the calling API function
        raise e


def login_user(username: str, password: str):
    from app.dao.users_dao import get_user_by_username  # Lazy import if desired

    user = get_user_by_username(username)
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return None, 'Invalid credentials'
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    return {'access_token': access_token, 'refresh_token': refresh_token}, None
