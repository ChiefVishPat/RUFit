from flask import Flask
from dotenv import load_dotenv
from .config import Config
from .extensions import db, bcrypt, jwt
from .routes.auth import auth_bp
from .routes.workouts import workouts_bp
from .routes.userinfo import userinfo_bp
from .routes.macro_tracker import tracker_bp
from .routes.exercises import exercises_bp
from .routes.recommendations import recommendations_bp # <-- new import
from .logging_config import logger

from sqlalchemy import event
from sqlalchemy.engine import Engine
import sqlite3


@event.listens_for(Engine, "connect")
def enable_sqlite_foreign_keys(dbapi_connection, connection_record):
    if isinstance(dbapi_connection, sqlite3.Connection):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

def create_app(config_class=Config):
    load_dotenv()
    app = Flask(__name__)
    app.config.from_object(config_class)
    app.config["JWT_SECRET_KEY"] = Config.JWT_SECRET_KEY
    app.config["JWT_ALGORITHM"] = "HS256"

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    with app.app_context():
        from .models import workout, users, userinfo, macro_tracker # noqa: F401

        #dbtest.drop_all()
        db.drop_all() # Keep commented unless needed
        db.create_all()

    app.register_blueprint(auth_bp)
    app.register_blueprint(workouts_bp)
    app.register_blueprint(userinfo_bp)
    app.register_blueprint(tracker_bp)
    app.register_blueprint(exercises_bp)
    app.register_blueprint(recommendations_bp) # <-- new blueprint

    logger.info("Application created successfully")
    return app