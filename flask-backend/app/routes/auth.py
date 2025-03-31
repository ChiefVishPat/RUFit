from flask import Blueprint, request, jsonify
from app.models.users import User  # Ensure file name matches (users.py)
from app.extensions import db, bcrypt
from flask_jwt_extended import (
    get_jwt_identity,
    create_access_token,
    create_refresh_token,
    verify_jwt_in_request,
    jwt_required,
    decode_token,
    JWTManager
)
from flask_jwt_extended.exceptions import JWTExtendedException
from datetime import datetime

from app.logging_config import logger  # Import our logger


auth_bp = Blueprint('auth', __name__, url_prefix='/auth')
jwt = JWTManager()

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    logger.info("Attempting registration for user: %s", username)

    if not username or not password:
        logger.warning("Registration failed: missing username or password")
        return jsonify({'message': 'Username and password required'}), 400

    if User.query.filter_by(username=username).first():
        logger.warning("Registration failed: User %s already exists", username)
        return jsonify({'message': 'Username already exists'}), 400
    
    if User.query.filter_by(email=email).first():
        logger.warning("Registration failed: User %s already exists", username)
        return jsonify({'message': 'Email is already registered'}), 400

    new_user = User(username=username, password=password, email=email)
    db.session.add(new_user)
    db.session.commit()

    logger.info("User %s registered successfully", username)
    return jsonify({'message': 'User registered successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        logger.warning("Login failed for user: %s", username)
        return jsonify({'message': 'Invalid credentials'}), 401

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    logger.info("User %s logged in successfully", username)
    return jsonify({'access_token': access_token, 'refresh_token':refresh_token}), 200

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
        decoded_token = decode_token(token)
        return jsonify({"expired": False}), 200
    except Exception as e:
        # This catches all JWT errors (expired, invalid, etc.)
        return jsonify({
            "expired": True,
            "reason": str(e)  # Optional: include error details
        }), 200

@jwt.invalid_token_loader
@jwt.expired_token_loader
@jwt.unauthorized_loader
def custom_error_response(reason):
    return jsonify({"expired": True, "reason": reason}), 200