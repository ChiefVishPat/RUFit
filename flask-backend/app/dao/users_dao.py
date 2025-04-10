from app.extensions import db
from app.logging_config import logger
from app.models.users import User


def get_user_by_username(username: str):
    try:
        return User.query.filter_by(username=username).first()
    except Exception as e:
        logger.error(f"Error in get_user_by_username('{username}'): {e}")
        raise


def get_user_by_email(email: str):
    try:
        return User.query.filter_by(email=email).first()
    except Exception as e:
        logger.error(f"Error in get_user_by_email('{email}'): {e}")
        raise


def create_user(username: str, password: str, email: str):
    try:
        new_user = User(username=username, password=password, email=email)
        db.session.add(new_user)
        db.session.commit()
        logger.info(f'User created successfully: {username}')
        return new_user
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating user '{username}': {e}")
        raise
