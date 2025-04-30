from app.extensions import db
from app.logging_config import logger
from app.models.userinfo import Userinfo
from app.models.users import User
import json


def get_userinfo_by_user(user_id: int):
    try:
        logger.info(User.query.all())
        return Userinfo.query.filter_by(user_id=user_id).first()
    except Exception as e:
        logger.error(f"Error fetching user info for user '{user_id}': {e}")
        raise


def create_userinfo(user_id: int, userinfo_data: dict):
    """
    userinfo_data: dict with keys - user_id, weight, weight_unit, height_ft, height_in, height_unit, gender, training_intensity, goal
    """
    logger.info("📦 user_data:\n" + json.dumps(userinfo_data, indent=2))
    logger.info(f"User id: {user_id}")
    try:
        new_userinfo = Userinfo(
            user_id=user_id,
            weight=userinfo_data.get('weight'),
            weight_unit=userinfo_data.get('weightUnit'),
            height_ft=userinfo_data.get('heightValue1'),
            height_in=userinfo_data.get('heightValue2'),
            height_unit=userinfo_data.get('heightUnit'),
            gender=userinfo_data.get('gender'),
            training_intensity=userinfo_data.get('trainingIntensity'),
            goal=userinfo_data.get('goal'),
            streak_goal=0
        )
        db.session.add(new_userinfo)
        db.session.commit()
        logger.info(f"User info created for user '{user_id}'")
        return new_userinfo
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating user info for user '{userinfo_data.get('user_id')}': {e}")
        raise


def update_userinfo(user_id: int, update_data: dict):
    try:
        userinfo = get_userinfo_by_user(user_id)
        if not userinfo:
            logger.warning(f"User info not found for user '{user_id}'")
            return None
        for key, value in update_data.items():
            setattr(userinfo, key, value)
        db.session.commit()
        logger.info(f"User info updated for user '{user_id}'")
        return userinfo
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating user info for user '{user_id}': {e}")
        raise
