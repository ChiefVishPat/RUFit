from flask import Blueprint, request, jsonify
from app.models.userinfo import Userinfo
from app.models.users import User
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.logging_config import logger
from ..tools.unit_conversion import SI_to_US_height, SI_to_US_weight
from ..tools.enums.userinfoEnums import GenderChoices, WeightUnits, HeightUnits, TrainingIntensityLevels, TrainingGoals

userinfo_bp = Blueprint("userinfo", __name__, url_prefix="/userinfo")


@userinfo_bp.route("", methods=["POST"])
@jwt_required()
def create_userinfo():
    user_id = get_jwt_identity()
    data = request.get_json().get("user_data")
    if not data:
        logger.warning(f"No user data provided for user {user_id}")
        return jsonify({"message": "No user data provided"}), 400

    try:
        weight = int(data.get("weight"))
        height_ft = int(data.get("heightValue1"))
        height_in = int(data.get("heightValue2"))
    except (ValueError, TypeError) as ve:
        logger.warning(f"Invalid numeric values provided for user {user_id}: {ve}")
        return jsonify({"message": "Invalid numeric values provided"}), 400

    gender = data.get("gender")
    weight_unit = data.get("weightUnit")
    height_unit = data.get("heightUnit")
    training_intensity = str(data.get("trainingIntensity")).upper()
    goal = str(data.get("goal")).upper()

    try:
        # Convert SI units if needed
        if height_unit == "SI":
            height_ft, height_in = SI_to_US_height(height_ft, height_in)
        if weight_unit.lower() == "kg":
            weight = SI_to_US_weight(weight)
    except Exception as e:
        logger.error(f"Conversion error for user {user_id}: {e}")
        return jsonify({"message": "Conversion error"}), 500

    try:
        new_userinfo = Userinfo(
            user_id=user_id,
            weight=weight,
            weight_unit=WeightUnits(weight_unit),
            height_ft=height_ft,
            height_in=height_in,
            height_unit=HeightUnits(height_unit),
            gender=GenderChoices(gender),
            training_intensity=TrainingIntensityLevels(training_intensity),
            goal=TrainingGoals(goal),
        )
        db.session.add(new_userinfo)
        db.session.commit()
        logger.info(f"Created userinfo for user {user_id}")
        return jsonify({"message": "User info updated successfully"}), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating userinfo for user {user_id}: {e}")
        return jsonify({"message": "Internal Server Error"}), 500


@userinfo_bp.route("", methods=["GET"])
@jwt_required()
def get_userinfo():
    user_id = get_jwt_identity()
    try:
        user = User.query.filter_by(id=user_id).first()
        userinfo = Userinfo.query.filter_by(user_id=user_id).first()
    except Exception as e:
        logger.error(f"Error fetching user info for user {user_id}: {e}")
        return jsonify({"message": "Internal Server Error"}), 500

    if not userinfo:
        logger.warning(f"Userinfo not found for user {user_id}")
        return jsonify({"message": "User info not found"}), 404

    try:
        response = {
            "username": user.username if user else "",
            "email": user.email if user else "",
            "gender": userinfo.gender.value,
            "weight": userinfo.weight,
            "weight_unit": userinfo.weight_unit.value,
            "height_ft": userinfo.height_ft,
            "height_in": userinfo.height_in,
            "height_unit": userinfo.height_unit.value,
            "training_intensity": userinfo.training_intensity.value,
            "goal": userinfo.goal.value,
        }
        logger.info(f"Fetched user info for user {user_id}")
        return jsonify(response), 200
    except Exception as e:
        logger.error(f"Error processing user info for user {user_id}: {e}")
        return jsonify({"message": "Internal Server Error"}), 500
