from flask import Blueprint, request, jsonify
from app.models.userinfo import Userinfo
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity

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

    if height_in is not None and (height_in < 0 or height_in > 11):
        return jsonify({'message': 'Height in inches must be between 0 and 11'}), 400

    if not all([weight, age, experience, height_ft, height_in, gender, goal]):
        return jsonify({'message': 'You must enter a value for all fields'}), 400

    new_userinfo = Userinfo(
        user_id=user_id, age=age, weight=weight,
        height_ft=height_ft, height_in=height_in,
        gender=gender, experience=experience, goal=goal
    )
    db.session.add(new_userinfo)
    db.session.commit()

    return jsonify({'message': 'New user data set!'}), 201

@userinfo_bp.route('', methods=['GET'])
@jwt_required()
def get_userinfo():
    user_id = get_jwt_identity()
    userinfo = Userinfo.query.filter_by(user_id=user_id).first()

    if not userinfo:
        return jsonify({'message': 'User info not found'}), 404

    return jsonify({
        'experience': userinfo.experience,
        'age': userinfo.age,
        'weight': userinfo.weight,
        'height_ft': userinfo.height_ft,
        'height_in': userinfo.height_in,
        'gender': userinfo.gender,
        'goal': userinfo.goal
    }), 200
