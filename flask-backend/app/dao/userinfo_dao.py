from app.extensions import db
from app.logging_config import logger
from app.models.userinfo import Userinfo
from app.models.users import User
import json

# Fetch a user's Userinfo record by their user_id
def get_userinfo_by_user(user_id: int):
    try:
        logger.info(User.query.all())  # Log all users (possibly for debugging)
        return Userinfo.query.filter_by(user_id=user_id).first()  # Get first matching user info
    except Exception as e:
        logger.error(f"Error fetching user info for user '{user_id}': {e}")
        raise  # Raise exception to be handled by the caller (e.g. API route)
        

# Create a new Userinfo entry in the database for a user
# Expects userinfo_data to contain keys like weight, height, gender, etc.
def create_userinfo(user_id: int, userinfo_data: dict):
    """
    userinfo_data: dict with keys - user_id, weight, weight_unit, height_ft,
    height_in, height_unit, gender, training_intensity, goal
    """
    logger.info("📦 user_data:\n" + json.dumps(userinfo_data, indent=2))  # Log submitted user data
    logger.info(f"User id: {user_id}")

    try:
        # Create a new Userinfo ORM object using the form data
        new_userinfo = Userinfo(
            user_id=user_id,
            weight=userinfo_data.get('weight'),
            weight_unit=userinfo_data.get('weightUnit'),              
            height_ft=userinfo_data.get('heightValue1'),              
            height_in=userinfo_data.get('heightValue2'),              
            height_unit=userinfo_data.get('heightUnit'),              
            gender=userinfo_data.get('gender'),                      
            training_intensity=userinfo_data.get('trainingIntensity'),
            goal=userinfo_data.get('goal'),                           '
            streak_goal=0                                             
        )

        db.session.add(new_userinfo)  # Add to SQLAlchemy session
        db.session.commit()           # Commit to database
        logger.info(f"User info created for user '{user_id}'")
        return new_userinfo           # Return the newly created record

    except Exception as e:
        db.session.rollback()  # Rollback in case of failure
        logger.error(f"Error creating user info for user '{userinfo_data.get('user_id')}': {e}")
        raise


# Update fields of an existing Userinfo entry
# Takes user_id to find the record and update_data dict to apply changes
def update_userinfo(user_id: int, update_data: dict):
    try:
        userinfo = get_userinfo_by_user(user_id)  # Get the current record for the user

        if not userinfo:
            logger.warning(f"User info not found for user '{user_id}'")
            return None  # No record found to update

        # Loop through each key-value pair and update the corresponding attribute
        for key, value in update_data.items():
            setattr(userinfo, key, value)

        db.session.commit()  # Save changes to the database
        logger.info(f"User info updated for user '{user_id}'")
        return userinfo      # Return the updated object

    except Exception as e:
        db.session.rollback()  # Rollback on any error
        logger.error(f"Error updating user info for user '{user_id}': {e}")
        raise
