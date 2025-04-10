from app import create_app, db

"""
ONLY RUN THIS FILE IF YOU MODIFY ANY DB TABLES AND NEED TO RECREATE THE DB.
THIS WILL DELETE ALL DATA ON THE DB AND START FROM A CLEAN SLATE.
"""

app = create_app()

with app.app_context():
    db.drop_all()  # WARNING: This will delete all data in your database!
    db.create_all()  # Recreates all tables based on your current models

print('Database tables dropped and recreated successfully!')
