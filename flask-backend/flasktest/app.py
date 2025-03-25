import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_sqlalchemy import SQLAlchemy


<<<<<<< HEAD
load_dotenv()

app = Flask(__name__)

CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
=======
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://flaskuser:password@cs431s25-13.cs.rutgers.edu/cs431'
app.config['JWT_SECRET_KEY'] = 'sprint1rufit'
>>>>>>> spr3-completed-frontend
app.config['SQLALCHEMY_ECHO'] = True
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] =False



db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
CORS(app)
jwt = JWTManager(app)



class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    
    def __init__(self, username, password):
        self.username = username
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

class Workout(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    exercise = db.Column(db.String(255), nullable=False)
    sets = db.Column(db.Integer, nullable=False)
    reps = db.Column(db.Integer, nullable=False)
    weight = db.Column(db.Float, nullable=True)
    date = db.Column(db.DateTime, default=db.func.current_timestamp())

    user = db.relationship('User', backref=db.backref('workouts', lazy=True))
<<<<<<< HEAD

class Userinfo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable = False)
    experience = db.Column(db.Enum('Beginner', 'Intermediate', 'Advanced', name ='experience_level'), nullable=False)
    goal = db.Column(db.Enum('Deficit', 'Surplus', 'Maintain', name ='training_goal'), nullable=False)
    age = db.Column(db.Integer, nullable= False)
    weight = db.Column(db.Integer, nullable = False)
    height_ft = db.Column(db.Integer, nullable= False)#height will be handled in two parts, ft and in
    height_in = db.Column(db.Integer, nullable= False)
    gender = db.Column(db.Enum('Male', 'Female', 'Other', name = 'gender_choice'), nullable = False)

    user = db.relationship('User', backref=db.backref('userinfo', uselist=False))
=======
>>>>>>> spr3-completed-frontend

with app.app_context():
    db.create_all()

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'message': 'Username and password required'}), 400

        if User.query.filter_by(username=username).first():
            return jsonify({'message': 'User already exists'}), 400

<<<<<<< HEAD
        new_user = User(username=username, password=password) 
=======
        new_user = User(username=username, password=password)  # ✅ Fix here
>>>>>>> spr3-completed-frontend
        db.session.add(new_user)
        db.session.commit()

        return jsonify({'message': 'User registered successfully'}), 201

    except Exception as e:
        print(f"Error in /register: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({'message': 'Invalid credentials'}), 401

    access_token = create_access_token(identity=username)
    return jsonify({'access_token': access_token}), 200


@app.route('/workout', methods=['POST'])
@jwt_required()
def workout():
    user_id=get_jwt_identity()
    data = request.get_json()
    exercise = data.get('exercise')
    reps = data.get('reps')
    sets = data.get('sets')
    weight = data.get('weight', 0) 


    if not exercise or not reps or not sets:
        return jsonify({'message':'you must enter a value for all fields' }), 400

    new_workout = Workout(user_id=user_id, exercise= exercise, reps= reps, sets= sets,weight= weight)
    db.session.add(new_workout)
    db.session.commit()

    return jsonify({'message': 'Good Work!'}), 201

@app.route('/workout', methods=['GET'])
@jwt_required()
def get_workout():
    user_id = get_jwt_identity()  # Get the logged-in user's ID
    workouts = Workout.query.filter_by(user_id=user_id).all()

    return jsonify(
    [
        {
            'exercise': workout.exercise,
            'reps': workout.reps,
            'sets': workout.sets,
            'weight': workout.weight,
            'date': workout.date.strftime('%Y-%m-%d %H:%M:%S')
        } for workout in workouts
    ]
    )

@app.route('/workout', methods=['PATCH'])
@jwt_required()
def patch_workout():
    user_id = get_jwt_identity()
    workout = Workout.query.filter_by(id=workout_id, user_id=user_id).first()

    if not workout:
        return jsonify({'message': 'invalid Workout or User'}), 404

    data = request.get_json()
    updatable_fields = ['exercise', 'sets', 'reps', 'weight']

    for field in updatable_fields:
        if field in data:
            setattr(workout, field, data[field])

    db.session.commit()
    return jsonify({'message': 'Workout updated successfully'}), 200

@app.route('/workout', methods=['DELETE'])
@jwt_required()
def delete_workout():
    user_id = get_jwt_identity()
    workout = Workout.query.filter_by(id=workout_id, user_id=user_id).first()

    if not workout:
        return jsonify({'message': 'Invalid workout or User'}), 404

    db.session.delete(workout)
    db.session.commit()
    return jsonify({'message': 'Workout removed!'}), 200

@app.route('/userinfo', methods=['POST'])
@jwt_required()
def userpref():
    user_id = get_jwt_identity()
    data = request.get_json()
    age = data.get('age')
    weight = data.get('weight')
    height_ft = data.get('height_ft')
    height_in = data.get('height_in')
    gender = data.get('gender')
    experience = data.get('expereience')
    goal = data.get('goal')

    if height_in is not None and (height_in < 0 or height_in > 11):
        return jsonify({'message': 'Height in inches must remain between 0 and 11'}), 400

    
    userinfo = Userinfo.query.filter_by(user_id=user_id).first()

    if not userinfo:
        userinfo = Userinfo(user_id=user_id)

    if Userinfo.query.filter_by(userid=user_id, id=userinof_id).first():
        return jsonify({'message': 'User info already exists'}), 400
    
    if not weight or not age or not experience or not height_ft or not height_in or not gender or not goal:
        return jsonify({'message':'you must enter a value for all fields' }), 400

    new_userinfo = Userinfo(user_id=user_id, age= age, weight=weight, height_ft=height_ft, height_in=height_in, gender= gender,experience=experience, goal=goal)
    db.session.add(new_userinfo)
    db.session.commit()

    return jsonify({'message': 'New user data set!'}), 201
    


    
    
@app.route('/userinfo', methods=['GET'])
@jwt_required()
def get_userinfo():
    user_id = get_jwt_identity()
    userinfo = Userinfo.query.filter_by(user_id=user_id).first()

    if not userpref:
        return jsonify({'message': 'User info invalid'}), 404

    return jsonify({
        'experience': userinfo.experience,
        'age': userinfo.age,
        'weight': userinfo.weight,
        'height_ft': userinfo.height_ft,
        'gender': userinfo.gender
    }), 200


if __name__ == '__main__':
    app.run(debug=True)
