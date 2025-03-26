from app.extensions import db

class Userinfo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    experience = db.Column(db.Enum('Beginner', 'Intermediate', 'Advanced', name='experience_level'), nullable=False)
    goal = db.Column(db.Enum('Deficit', 'Surplus', 'Maintain', name='training_goal'), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    weight = db.Column(db.Integer, nullable=False)
    height_ft = db.Column(db.Integer, nullable=False)
    height_in = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.Enum('Male', 'Female', 'Other', name='gender_choice'), nullable=False)

    user = db.relationship('User', backref=db.backref('userinfo', uselist=False))
