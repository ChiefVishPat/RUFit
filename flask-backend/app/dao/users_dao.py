from app.extensions import db
from app.logging_config import logger
from app.models.users import User

# Retrieve a user by their username (used for login/auth)
def get_user_by_username(username: str) -> User | None:
    try:
        return User.query.filter_by(username=username).first()  # Return first match if exists
    except Exception as e:
        logger.error(f"Error in get_user_by_username('{username}'): {e}")
        raise  # Propagate error for higher-level handling

# Retrieve a user by primary key (user_id) using db.session.get (efficient for PK lookups)
def get_user_by_id(user_id: int) -> User | None:
    return db.session.get(User, user_id)

# Retrieve a user by email (used for registration checks or password reset)
def get_user_by_email(email: str) -> User | None:
    try:
        return User.query.filter_by(email=email).first()  # Return matching user by email
    except Exception as e:
        logger.error(f"Error in get_user_by_email('{email}'): {e}")
        raise

# Create a new user and persist to the database
def create_user(username: str, password: str, email: str) -> User:
    try:
        # Create a new user object using the constructor (password should be hashed beforehand)
        new_user = User(username=username, password=password, email=email)

        # Stage the new user for insertion
        db.session.add(new_user)

        # Commit the session to save the user
        db.session.commit()
        logger.info(f'User created successfully: {username}')
        return new_user  # Return the created user object

    except Exception as e:
        db.session.rollback()  # Roll back any changes if error occurs
        logger.error(f"Error creating user '{username}': {e}")
        raise

# Delete a user by their ID
def delete_user_by_id(user_id: int) -> bool:
    try:
        user = db.session.get(User, user_id)  # Efficient fetch by primary key
        if not user:
            return False  # Return False if no such user exists

        db.session.delete(user)   # Stage deletion
        db.session.commit()       # Commit changes
        logger.info(f'User deleted: {user_id}')
        return True

    except Exception as e:
        db.session.rollback()  # Undo deletion if something goes wrong
        logger.error(f"Error deleting user '{user_id}': {e}")
        raise
