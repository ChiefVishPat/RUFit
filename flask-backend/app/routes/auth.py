from flask import Blueprint, request, jsonify
from app.models.users import User  # Ensure file name matches (users.py)
from app.extensions import db, bcrypt
from flask_jwt_extended import (
    get_jwt_identity,
    create_access_token,
    create_refresh_token,
    jwt_required,
    decode_token,
    JWTManager,
)

from app.logging_config import logger


auth_bp = Blueprint("auth", __name__, url_prefix="/auth")
jwt = JWTManager()


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    email = data.get("email")

    if not username or not password:
        logger.warning("Registration failed: Missing username or password")
        return jsonify({"message": "Username and password are required"}), 400

    try:
        if User.query.filter_by(username=username).first():
            logger.warning(f"Registration failed: User {username} already exists")
            return jsonify({"message": "Username already exists"}), 400

        if User.query.filter_by(email=email).first():
            logger.warning(f"Registration failed: Email {email} already exists")
            return jsonify({"message": "Email already exists"}), 400

        new_user = User(username=username, password=password, email=email)
        db.session.add(new_user)
        db.session.commit()
        logger.info(f"User {username} registered successfully")
        return jsonify({"message": "User registered successfully"}), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error during registration for user {username}: {e}")
        return jsonify({"message": "Internal Server Error"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    try:
        user = User.query.filter_by(username=username).first()
        if not user or not bcrypt.check_password_hash(user.password_hash, password):
            logger.warning(f"Login failed for user: {username}")
            return jsonify({"message": "Invalid credentials"}), 401

        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        logger.info(f"User {username} logged in successfully")
        return jsonify({"access_token": access_token, "refresh_token": refresh_token}), 200

    except Exception as e:
        logger.error(f"Error during login for user {username}: {e}")
        return jsonify({"message": "Internal Server Error"}), 500


# Endpoint to refresh an access token using a refresh token
@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user)
    new_refresh_token = create_refresh_token(identity=current_user)
    return jsonify(access_token=new_access_token, refresh_token=new_refresh_token)


# Checks if access token has expired:
@auth_bp.route("/is-token-expired", methods=["POST"])
def is_token_expired():
    data = request.get_json()
    token = data.get("access_token")

    if not token:
        return jsonify({"error": "Access token missing"}), 400
    try:
        decode_token(token)
        return jsonify({"expired": False}), 200
    except Exception as e:
        # This catches all JWT errors (expired, invalid, etc.)
        return jsonify(
            {
                "expired": True,
                "reason": str(e),  # Optional: include error details
            }
        ), 200


@jwt.invalid_token_loader
@jwt.expired_token_loader
@jwt.unauthorized_loader
def custom_error_response(reason):
    return jsonify({"expired": True, "reason": reason}), 200
