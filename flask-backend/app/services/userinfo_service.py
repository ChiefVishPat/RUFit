from app.dao.userinfo_dao import create_userinfo, get_userinfo_by_user, update_userinfo
from app.extensions import db
from app.logging_config import logger


def add_or_update_userinfo(user_id: str, userinfo_data: dict):
    try:
        existing = get_userinfo_by_user(user_id)
        if existing:
            updated = update_userinfo(user_id, userinfo_data)
            logger.info(f'User info updated for user {user_id}')
            return updated, 'updated'
        else:
            new_info = create_userinfo(userinfo_data)
            logger.info(f'User info created for user {user_id}')
            return new_info, 'created'
    except Exception as e:
        db.session.rollback()
        logger.error(f'Error processing user info for user {user_id}: {e}')
        raise e


def fetch_userinfo(user_id: str):
    try:
        return get_userinfo_by_user(user_id)
    except Exception as e:
        logger.error(f'Error fetching user info for user {user_id}: {e}')
        raise e
