from flask_jwt_extended import create_access_token, create_refresh_token, decode_token

from app.dao.users_dao import create_user, delete_user_by_id, get_user_by_email, get_user_by_id, get_user_by_username
from app.extensions import bcrypt, db
from app.logging_config import logger
from app.models.users import User


def register_user(username: str, password: str, email: str) -> tuple[User | None, str | None]:
    # Check if user already exists
    if get_user_by_username(username):
        logger.warning(f"register_user: username '{username}' already exists")
        return None, 'Username already exists'
    if get_user_by_email(email):
        logger.warning(f"register_user: email '{email}' already exists")
        return None, 'Email already exists'
    try:
        user = create_user(username, password, email)
        logger.info(f"register_user: created new user '{username}' (id={user.id})")
        return user, None
    except Exception as e:
        db.session.rollback()
        logger.error(f"register_user: error creating user '{username}': {e}")
        raise


def login_user(username: str, password: str) -> tuple[dict | None, str | None]:
    user = get_user_by_username(username)
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        logger.warning(f"login_user: invalid credentials for username '{username}'")
        return None, 'Invalid credentials'

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    logger.info(f"login_user: user '{username}' (id={user.id}) logged in successfully")
    return {'access_token': access_token, 'refresh_token': refresh_token}, None


def delete_account(user_id: int) -> bool:
    result = delete_user_by_id(user_id)
    if result:
        logger.info(f'delete_account: user id={user_id} deleted successfully')
    else:
        logger.warning(f'delete_account: no user found with id={user_id}')
    return result


def refresh_tokens_for_user(identity: str) -> tuple[dict | None, str | None]:
    """Given a valid refresh identity (str user_id), issue new tokens."""
    user = get_user_by_id(int(identity))
    if not user:
        logger.warning(f'refresh_tokens_for_user: no user found with id={identity}')
        return None, 'User does not exist'

    access = create_access_token(identity=identity)
    refresh = create_refresh_token(identity=identity)
    logger.info(f'refresh_tokens_for_user: issued new tokens for user id={identity}')
    return {'access_token': access, 'refresh_token': refresh}, None


def check_token_expired(access_token: str) -> tuple[bool, str | None]:
    """
    Decode the token; return (expired_flag, reason).
    - expired_flag=True  => token is invalid/expired
    - expired_flag=False => token is valid
    """
    if not access_token:
        logger.warning('check_token_expired: no access token provided')
        return True, 'Access token missing'

    try:
        payload = decode_token(access_token)
        user_id = payload.get('sub')
        if not get_user_by_id(int(user_id)):
            logger.warning(f'check_token_expired: token for non-existent user id={user_id}')
            return True, 'User no longer exists'

        logger.debug(f'check_token_expired: token valid for user id={user_id}')
        return False, None

    except Exception as e:
        logger.error(f'check_token_expired: token decode failed: {e}')
        return True, str(e)
