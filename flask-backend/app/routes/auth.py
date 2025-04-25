from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.logging_config import logger
from app.services.auth_service import login_user, register_user

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    print(data)
    if not data:
        return jsonify({'message': 'Invalid or missing JSON payload'}), 400
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    if not username or not password:
        logger.warning('Registration failed: Missing username or password')
        return jsonify({'message': 'Username and password are required'}), 400

    try:
        user, err = register_user(username, password, email)
        if err:
            logger.warning(f'Registration failed: {err}')
            return jsonify({'message': err}), 400
        logger.info(f'User {username} registered successfully')
        return jsonify({'message': 'User registered successfully'}), 201

    except Exception as e:
        logger.error(f'Error during registration for user {username}: {e}')
        return jsonify({'message': 'Internal Server Error'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    try:
        tokens, err = login_user(username, password)
        if err:
            logger.warning(f'Login failed for user: {username}')
            return jsonify({'message': err}), 401
        logger.info(f'User {username} logged in successfully')
        return jsonify(tokens), 200

    except Exception as e:
        logger.error(f'Error during login for user {username}: {e}')
        return jsonify({'message': 'Internal Server Error'}), 500


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    # This endpoint can simply call the refresh logic from your JWT settings
    from flask import jsonify
    from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity, jwt_required

    try:
        # For refresh, the endpoint itself uses jwt_required(refresh=True)
        # so that a valid refresh token is required.
        # jwt_required(refresh=True)
        current_user = get_jwt_identity()
        new_access_token = create_access_token(identity=current_user)
        new_refresh_token = create_refresh_token(identity=current_user)
        logger.info(f'User {current_user} token refreshed successfully')
        return jsonify({'access_token': new_access_token, 'refresh_token': new_refresh_token}), 200
    except Exception as e:
        logger.error(f'Error during token refresh: {e}')
        return jsonify({'message': 'Internal Server Error'}), 500


@auth_bp.route('/is-token-expired', methods=['POST'])
def is_token_expired():
    data = request.get_json()
    token = data.get('access_token')
    if not token:
        return jsonify({'error': 'Access token missing'}), 400
    try:
        from flask_jwt_extended import decode_token

        decode_token(token)  # This will raise an exception if token is invalid or expired
        return jsonify({'expired': False}), 200
    except Exception as e:
        return jsonify({'expired': True, 'reason': str(e)}), 200


# Custom error handlers for JWT
from flask_jwt_extended import JWTManager

jwt = JWTManager()


@jwt.invalid_token_loader
@jwt.expired_token_loader
@jwt.unauthorized_loader
def custom_error_response(reason):
    return jsonify({'expired': True, 'reason': reason}), 200
