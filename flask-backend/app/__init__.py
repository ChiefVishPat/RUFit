from flask import Flask
from dotenv import load_dotenv
from .config import Config
from .extensions import db, bcrypt, jwt
from .routes.auth import auth_bp
from .routes.workouts import workouts_bp
from .routes.userinfo import userinfo_bp
from .logging_config import logger

def create_app():
    load_dotenv()
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    with app.app_context():
        from .models import workout, users, userinfo
        db.create_all()

    app.register_blueprint(auth_bp)
    app.register_blueprint(workouts_bp)
    app.register_blueprint(userinfo_bp)

    logger.info("Application created successfully")
    return app