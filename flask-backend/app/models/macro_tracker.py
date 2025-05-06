from app.extensions import db

#the database model for macro tracker, includes all macros in food items
class Tracker(db.Model):
    #
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)

    food_name = db.Column(db.String(255), nullable=False)
    date = db.Column(db.Date, nullable=False)

    # Macros: using integer for calorie and floats for the others.
    calories = db.Column(db.Integer, default=0)
    carbs = db.Column(db.Float, default=0.0)
    sat_fat = db.Column(db.Float, default=0.0)
    unsat_fat = db.Column(db.Float, default=0.0)
    fiber = db.Column(db.Float, default=0.0)
    protein = db.Column(db.Float, default=0.0)

    barcode = db.Column(db.String(50), nullable= True, default=None) #im setting nullable to true so that users can optionally enter a barcode

    user = db.relationship('User', backref=db.backref('tracker', lazy=True, cascade='all, delete-orphan', passive_deletes=True))

