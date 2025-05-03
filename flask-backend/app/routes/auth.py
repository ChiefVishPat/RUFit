from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required, unset_jwt_cookies

from app.services.auth_service import delete_account, login_user, register_user

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username, password, email = data.get('username'), data.get('password'), data.get('email')
    if not username or not password:
        return jsonify(message='Username and password are required'), 400

    user, err = register_user(username, password, email)
    if err:
        return jsonify(message=err), 400
    return jsonify(message='User registered successfully'), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    tokens, err = login_user(data.get('username'), data.get('password'))
    if err:
        return jsonify(message=err), 401
    return jsonify(tokens), 200


@auth_bp.route('/account', methods=['DELETE'])
@jwt_required()
def delete_user():
    uid = int(get_jwt_identity())
    if not delete_account(uid):
        return jsonify(message='User not found'), 404
    resp = jsonify(message='Account deleted')
    unset_jwt_cookies(resp)
    return resp, 200
