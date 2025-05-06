from app.dao.userinfo_dao import create_userinfo, get_userinfo_by_user, update_userinfo
from app.extensions import db
from app.logging_config import logger
import json


# Adds new user info if it doesn't exist, or updates it if it already does
def add_or_update_userinfo(user_id: int, userinfo_data: dict):
    logger.info("user_data:\n" + json.dumps(userinfo_data, indent=2))
    try:
        existing = get_userinfo_by_user(user_id)
        if existing:
            # If info already exists, update it with new values
            updated = update_userinfo(user_id, userinfo_data)
            logger.info(f'User info updated for user {user_id}')
            return updated, 'updated'
        else:
            # If this is the first time, create a new userinfo record
            new_info = create_userinfo(user_id, userinfo_data)
            logger.info(f'User info created for user {user_id}')
            return new_info, 'created'
    except Exception as e:
        db.session.rollback()
        logger.error(f'Error processing user info for user {user_id}: {e}')
        raise e


# Fetches user profile info for the given user ID
def fetch_userinfo(user_id: int):
    logger.info(type(user_id))
    logger.info(user_id)
    try:
        return get_userinfo_by_user(user_id)
    except Exception as e:
        logger.error(f'Error fetching user info for user {user_id}: {e}')
        raise e
