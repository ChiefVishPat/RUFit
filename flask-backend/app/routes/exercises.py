import os
import csv
import re
from flask import Blueprint, jsonify, request

# Create a Flask blueprint for exercise API routes.
exercises_bp = Blueprint('exercises', __name__, url_prefix='/exercises')

# In-memory list to store exercise data.
exercises = []


def clean_field(value):
    """
    Remove all characters from the string except for alphanumeric characters, commas, periods, semicolons, and spaces.
    """
    return re.sub(r'[^a-zA-Z0-9,.; ]', '', value)


def load_exercises_from_csv():
    """
    Load exercises from a CSV file.
    Expected CSV columns: "Exercise Name", "Muscle Group(s)", "Instructions", and "Tips".
    The "Muscle Group(s)" column should contain values separated by commas.
    The "Tips" column should contain tips separated by semicolons if there are multiple.
    This function cleans each field to remove unwanted characters.
    """
    global exercises
    exercises.clear()
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Move up one level, then into 'data'
    csv_path = os.path.join(current_dir, '..', 'data', 'exercises.csv')
    print("Computed CSV Path:", csv_path)  # Debug the computed path

    try:
        with open(csv_path, 'r', newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                # Clean each field.
                exercise_name = clean_field(row['Exercise Name']).strip()
                muscle_groups_raw = clean_field(row['Muscle Group(s)'])
                # Split by comma into a list; ignore any empty strings.
                groups = [group.strip() for group in muscle_groups_raw.split(',') if group.strip()]
                instructions = clean_field(row['Instructions']).strip()
                
                # Clean the Tips column and split on semicolon delimiter.
                tips_raw = clean_field(row['Tips']).strip()
                tips = [tip.strip() for tip in tips_raw.split(';') if tip.strip()]

                exercise = {
                    'exercise_name': exercise_name,
                    'muscle_groups': groups,
                    'instructions': instructions,
                    'tips': tips  # this is now a list of individual tips
                }
                exercises.append(exercise)
    except Exception as e:
        print(f"Error loading CSV file: {e}")


# Load the exercises once at startup.
load_exercises_from_csv()


@exercises_bp.route('', methods=['GET'])
def get_exercises():
    """
    API endpoint to return a list of exercises.
    
    Query Parameters:
        - search: (optional) A substring to search in exercise names (case-insensitive).
        - muscle_groups: (optional) A comma-separated list of muscle groups.
          Only exercises including all specified muscle groups (after cleaning) will be returned.
    
    Returns:
        JSON list of matching exercise dictionaries.
    """
    search_term = request.args.get('search', '').strip().lower()
    muscle_groups_filter = request.args.get('muscle_groups', '').strip().lower()

    # Start with all exercises.
    filtered_exercises = exercises

    # Filter by exercise name if a search term is provided.
    if search_term:
        filtered_exercises = [
            ex for ex in filtered_exercises
            if search_term in ex['exercise_name'].lower()
        ]

    # Filter by muscle groups if provided.
    if muscle_groups_filter:
        filter_groups = [grp.strip() for grp in muscle_groups_filter.split(',') if grp.strip()]
        filtered_exercises = [
            ex for ex in filtered_exercises
            if all(fg in [mg.lower() for mg in ex['muscle_groups']] for fg in filter_groups)
        ]

    return jsonify(filtered_exercises)
