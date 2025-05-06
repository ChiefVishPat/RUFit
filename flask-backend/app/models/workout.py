from app.extensions import db

#database model for workout
class Workout(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)

    workout_name = db.Column(db.String(255), nullable=False)
    session_id = db.Column(db.String(36), nullable=False)
    exercise = db.Column(db.String(255), nullable=False)
    sets = db.Column(db.Integer, nullable=False)
    reps = db.Column(db.Integer, nullable=False)
    weight = db.Column(db.Float, nullable=True)
    date = db.Column(db.DateTime, default=db.func.current_timestamp())

    user = db.relationship('User', backref=db.backref('workouts', lazy=True, cascade='all, delete-orphan', passive_deletes=True))

