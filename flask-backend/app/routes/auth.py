from flask import Blueprint, request, jsonify
from app.models.users import User  # Ensure file name matches (users.py)
from app.extensions import db, bcrypt
from flask_jwt_extended import create_access_token, create_refresh_token
from app.logging_config import logger  # Import our logger

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    logger.info("Attempting registration for user: %s", username)

    if not username or not password:
        logger.warning("Registration failed: missing username or password")
        return jsonify({'message': 'Username and password required'}), 400

    if User.query.filter_by(username=username).first():
        logger.warning("Registration failed: User %s already exists", username)
        return jsonify({'message': 'User already exists'}), 400

    new_user = User(username=username, password=password)
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

