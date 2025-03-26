from app.extensions import db, bcrypt

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)

    def __init__(self, username, password):
        self.username = username
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
