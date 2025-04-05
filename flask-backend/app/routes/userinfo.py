from flask import Blueprint, request, jsonify
from app.models.userinfo import Userinfo
from app.models.users import User
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.logging_config import logger
from ..tools.unit_conversion import SI_to_US_height, SI_to_US_weight
from ..tools.enums.userinfoEnums import *

userinfo_bp = Blueprint('userinfo', __name__, url_prefix='/userinfo')

@userinfo_bp.route('', methods=['POST'])
@jwt_required()
def create_userinfo():
    user_id = get_jwt_identity()
    data = request.get_json().get('user_data')
    logger.info(request)
    logger.info(data)

    #age = data.get('age')
    gender = str(data.get('gender')).upper()
    weight = int(data.get('weight'))
    weight_unit = str(data.get('weightUnit')).upper()

    # convert weight to pounds if necessary:
    if weight_unit == "KG":
        weight = SI_to_US_weight(weight)

    height_ft = int(data.get('heightValue1'))
    height_in = int(data.get('heightValue2'))
    height_unit = str(data.get('heightUnit')).upper()

    if height_unit == "SI":
        height_ft, height_in = SI_to_US_height(height_ft, height_in)
    
    training_intensity = str(data.get('trainingIntensity')).upper()
    goal = str(data.get('goal')).upper()

    logger.info("User %s is submitting userinfo", user_id)

    if height_in is not None and (height_in < 0 or height_in > 11):
        logger.warning("User %s provided invalid height_in: %s", user_id, height_in)
        return jsonify({'message': 'Height in inches must be between 0 and 11'}), 400

    if not all([weight, weight_unit, training_intensity, height_ft, height_in, height_unit, gender, goal]):
        logger.warning("User %s failed to provide all required fields", user_id)
        return jsonify({'message': 'You must enter a value for all fields'}), 400

    new_userinfo = Userinfo(
        user_id=user_id, weight=weight, weight_unit=WeightUnits(weight_unit),
        height_ft=height_ft, height_in=height_in, height_unit=HeightUnits(height_unit),
        gender=GenderChoices(gender), training_intensity=TrainingIntensityLevels(training_intensity), goal=TrainingGoals(goal)
    )
    
    logger.info(gender)
    logger.info(GenderChoices(gender))

    db.session.add(new_userinfo)
    db.session.commit()

    logger.info("User %s userinfo created successfully", user_id)
    return jsonify({'message': 'New user data set!'}), 201

@userinfo_bp.route('', methods=['GET'])
@jwt_required()
def get_userinfo():
    user_id = get_jwt_identity()
    user = User.query.filter_by(id=user_id).first()
    userinfo = Userinfo.query.filter_by(user_id=user_id).first()

    if not userinfo:
        logger.warning("User info not found for user %s", user_id)
        return jsonify({'message': 'User info not found'}), 404

    logger.info("User info retrieved for user %s", user_id)
    logger.info(userinfo)
    return jsonify({
        'username':user.username,
        'email':user.email,
        'gender': userinfo.gender.value,
        #'age': userinfo.age,
        'weight': userinfo.weight,
        'weight_unit': userinfo.weight_unit.value,
        'height_ft': userinfo.height_ft,
        'height_in': userinfo.height_in,
        'height_unit': userinfo.height_unit.value,
        'training_intensity': userinfo.training_intensity.value,
        'goal': userinfo.goal.value
    }), 200
