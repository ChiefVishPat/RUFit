from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    get_jwt_identity,
    jwt_required,
    unset_jwt_cookies,
)

from app.extensions import db
from app.logging_config import logger
from app.models.users import User
from app.services.auth_service import (
    check_token_expired,
    delete_account,
    login_user,
    refresh_tokens_for_user,
    register_user,
)

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json() or {}
        logger.debug(f'[REGISTER] Payload received: {data}')

        username = data.get('username')
        password = data.get('password')
        email = data.get('email')

        if not username or not password:
            logger.warning('[REGISTER] Missing username or password')
            return jsonify(message='Username and password are required'), 400

        user, err = register_user(username, password, email)
        if err:
            logger.warning(f'[REGISTER] Registration failed: {err}')
            return jsonify(message=err), 400

        logger.info(f"[REGISTER] User '{username}' registered successfully (id={user.id})")
        return jsonify(message='User registered successfully'), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f'[REGISTER] Exception during registration: {e}')
        return jsonify(message='Internal Server Error'), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json() or {}
        logger.debug(f'[LOGIN] Payload received: {data}')

        tokens, err = login_user(data.get('username'), data.get('password'))
        if err:
            logger.warning(f'[LOGIN] Login failed: {err}')
            return jsonify(message=err), 401

        logger.info(f'[LOGIN] User logged in successfully (username={data.get("username")})')
        return jsonify(tokens), 200

    except Exception as e:
        logger.error(f'[LOGIN] Exception during login: {e}')
        return jsonify(message='Internal Server Error'), 500


@auth_bp.route('/account', methods=['DELETE'])
@jwt_required()
def delete_user():
    try:
        uid = int(get_jwt_identity())
        logger.debug(f'[DELETE_ACCOUNT] Request by user id={uid}')

        if not delete_account(uid):
            logger.warning(f'[DELETE_ACCOUNT] No user found with id={uid}')
            return jsonify(message='User not found'), 404

        resp = jsonify(message='Account deleted successfully')
        unset_jwt_cookies(resp)
        logger.info(f'[DELETE_ACCOUNT] User id={uid} account deleted')
        return resp, 200

    except Exception as e:
        db.session.rollback()
        logger.error(f'[DELETE_ACCOUNT] Exception deleting account for id={uid}: {e}')
        return jsonify(message='Internal Server Error'), 500


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        identity = get_jwt_identity()
        logger.debug(f'[REFRESH] Refresh requested for user id={identity}')

        tokens, err = refresh_tokens_for_user(identity)
        if err:
            logger.warning(f'[REFRESH] Token refresh failed: {err}')
            return jsonify(message=err), 401

        logger.info(f'[REFRESH] Tokens refreshed for user id={identity}')
        return jsonify(tokens), 200

    except Exception as e:
        logger.error(f'[REFRESH] Exception during token refresh: {e}')
        return jsonify(message='Internal Server Error'), 500


@auth_bp.route('/is-token-expired', methods=['POST'])
def is_token_expired():
    try:
        body = request.get_json() or {}
        logger.debug(f'[CHECK_TOKEN] Payload received: {body}')

        expired, reason = check_token_expired(body.get('access_token'))
        response = {'expired': expired}
        if reason:
            response['reason'] = reason

        logger.info(f'[CHECK_TOKEN] Token expired={expired}, reason={reason}')
        return jsonify(response), 200

    except Exception as e:
        logger.error(f'[CHECK_TOKEN] Exception checking token expiry: {e}')
        return jsonify(message='Internal Server Error'), 500


# Custom error handlers for JWT
from flask_jwt_extended import JWTManager

jwt = JWTManager()


@jwt.invalid_token_loader
@jwt.expired_token_loader
@jwt.unauthorized_loader
def custom_error_response(reason):
    logger.warning(f'[JWT_ERROR] {reason}')
    return jsonify(expired=True, reason=reason), 200
