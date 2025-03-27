from flask import Blueprint, request, jsonify
from app.models.userinfo import Userinfo
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.logging_config import logger

userinfo_bp = Blueprint('userinfo', __name__, url_prefix='/userinfo')

@userinfo_bp.route('', methods=['POST'])
@jwt_required()
def create_userinfo():
    user_id = get_jwt_identity()
    data = request.get_json()

    age = data.get('age')
    weight = data.get('weight')
    height_ft = data.get('height_ft')
    height_in = data.get('height_in')
    gender = data.get('gender')
    experience = data.get('experience')
    goal = data.get('goal')

    logger.info("User %s is submitting userinfo", user_id)

    if height_in is not None and (height_in < 0 or height_in > 11):
        logger.warning("User %s provided invalid height_in: %s", user_id, height_in)
        return jsonify({'message': 'Height in inches must be between 0 and 11'}), 400

    if not all([weight, age, experience, height_ft, height_in, gender, goal]):
        logger.warning("User %s failed to provide all required fields", user_id)
        return jsonify({'message': 'You must enter a value for all fields'}), 400

    new_userinfo = Userinfo(
        user_id=user_id, age=age, weight=weight,
        height_ft=height_ft, height_in=height_in,
        gender=gender, experience=experience, goal=goal
    )
    db.session.add(new_userinfo)
    db.session.commit()

    logger.info("User %s userinfo created successfully", user_id)
    return jsonify({'message': 'New user data set!'}), 201

@userinfo_bp.route('', methods=['GET'])
@jwt_required()
def get_userinfo():
    user_id = get_jwt_identity()
    userinfo = Userinfo.query.filter_by(user_id=user_id).first()

    if not userinfo:
        logger.warning("User info not found for user %s", user_id)
        return jsonify({'message': 'User info not found'}), 404

    logger.info("User info retrieved for user %s", user_id)
    return jsonify({
        'experience': userinfo.experience,
        'age': userinfo.age,
        'weight': userinfo.weight,
        'height_ft': userinfo.height_ft,
        'height_in': userinfo.height_in,
        'gender': userinfo.gender,
        'goal': userinfo.goal
    }), 200
