from sqlalchemy import desc
from app.extensions import db
from app.models.macro_tracker import Tracker

# Fetch all macro tracker records for a given user.
# If a specific date is provided, filter by that date.
# Otherwise, return all entries ordered by most recent date first.
def get_tracker_records(user_id: int, date=None):
    """Fetch all or date-filtered daily macro records for a user."""
    query = Tracker.query.filter_by(user_id=user_id)
    if date:
        query = query.filter_by(date=date)
    else:
        query = query.order_by(desc(Tracker.date))
    return query.all()

# Fetch a single tracker record by both user ID and record ID.
def get_tracker_by_id(user_id: int, record_id: int):
    return Tracker.query.filter_by(user_id=user_id, id=record_id).first()

# Insert a new macro tracking entry into the session.
def insert_tracker(user_id: int, date, food_name: str, macros: dict):
    rec = Tracker(
        user_id=user_id,
        date=date,
        food_name=food_name,
        calories=macros['calories'],     
        protein=macros['protein'],       
        carbs=macros['carbs'],           
        fiber=macros['fiber'],          
        unsat_fat=macros['unsat_fat'],   
        sat_fat=macros['sat_fat'],       
    )
    db.session.add(rec)  # Add to the session but does not commit the information yet
    return rec           # Return the new ORM object for reference

# Commits the data
def commit_changes():
    db.session.commit()

# Delete a tracker entry from the session.

def delete_tracker(rec: Tracker):
    db.session.delete(rec)
