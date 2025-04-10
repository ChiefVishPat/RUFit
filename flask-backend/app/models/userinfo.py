from app.extensions import db

from ..tools.enums.userinfoEnums import GenderChoices, HeightUnits, TrainingGoals, TrainingIntensityLevels, WeightUnits


class Userinfo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    gender = db.Column(db.Enum(GenderChoices, name='gender_choice'), nullable=False)
    weight = db.Column(db.Integer, nullable=False)
    weight_unit = db.Column(db.Enum(WeightUnits, name='weight_unit'), nullable=False)
    height_ft = db.Column(db.Integer, nullable=False)
    height_in = db.Column(db.Integer, nullable=False)
    height_unit = db.Column(db.Enum(HeightUnits, name='height_unit'), nullable=False)
    training_intensity = db.Column(db.Enum(TrainingIntensityLevels, name='training_intensity'), nullable=False)
    goal = db.Column(db.Enum(TrainingGoals, name='training_goal'), nullable=False)
    # age = db.Column(db.Integer, nullable=False)

    user = db.relationship('User', backref=db.backref('userinfo', uselist=False))
