from app.extensions import db

class Tracker(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    food_name = db.Column(db.String(255), nullable=False)
    date = db.Column(db.Date, nullable=False)

    # Macros: using integer for calorie and floats for the others.
    calorie = db.Column(db.Integer, default=0)
    carbs = db.Column(db.Float, default=0.0)
    sat_fat = db.Column(db.Float, default=0.0)
    unsat_fat = db.Column(db.Float, default=0.0)
    fiber = db.Column(db.Float, default=0.0)
    protein = db.Column(db.Float, default=0.0)

    user = db.relationship('User', backref=db.backref('tracker', lazy=True))
