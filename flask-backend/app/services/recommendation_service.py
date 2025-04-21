import csv
import os
from collections import defaultdict
from typing import Dict, List, Optional, Tuple

from app.dao.userinfo_dao import get_userinfo_by_user
from app.dao.workout_dao import get_workouts_by_user, get_workouts_by_user_and_exercise
from app.logging_config import logger
from app.models.userinfo import TrainingGoals, TrainingIntensityLevels, WeightUnits
from app.models.workout import Workout

# Constants for recommendation logic
PLATEAU_SESSIONS = 3  # Number of sessions without progress to detect a plateau
PROGRESS_THRESHOLD = 0.02  # Minimum 2% volume increase to count as progress
WEIGHT_INCREMENT_LB = {
    TrainingIntensityLevels.AMATEUR: 2.5,
    TrainingIntensityLevels.EXPERIENCED: 5.0,
    TrainingIntensityLevels.PROFESSIONAL: 5.0,  # Professionals might use smaller % increments more often, but we'll keep it simple
}
WEIGHT_INCREMENT_KG = {
    TrainingIntensityLevels.AMATEUR: 1.0,
    TrainingIntensityLevels.EXPERIENCED: 2.5,
    TrainingIntensityLevels.PROFESSIONAL: 2.5,
}
REP_INCREMENT = {
    TrainingIntensityLevels.AMATEUR: 1,
    TrainingIntensityLevels.EXPERIENCED: 1,
    TrainingIntensityLevels.PROFESSIONAL: 1, # Or sometimes 0 if weight jumps significantly
}
DELOAD_FACTOR = 0.8 # Reduce weight/volume by 20% for a deload recommendation

# Target Rep Ranges based on Goal
REP_RANGES = {
    TrainingGoals.SURPLUS: (4, 8),  # Strength focus initially
    TrainingGoals.MAINTAIN: (8, 15),
    TrainingGoals.DEFICIT: (8, 15), # Focus on maintaining intensity
}

# In-memory cache for exercises data to avoid repeated loading
_exercises_data = None
_muscle_group_map = None

def _load_exercises_data():
    """Loads exercise data from CSV if not already loaded."""
    global _exercises_data, _muscle_group_map
    if _exercises_data is not None:
        return

    _exercises_data = []
    _muscle_group_map = defaultdict(list)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(current_dir, '..', 'data', 'exercises.csv')

    try:
        with open(csv_path, 'r', newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                exercise_name = row.get('Exercise Name','').strip()
                muscle_groups_raw = row.get('Muscle Group(s)', '').strip()
                groups = [group.strip().lower() for group in muscle_groups_raw.split(';') if group.strip()]
                if exercise_name and groups:
                     _exercises_data.append({'name': exercise_name, 'groups': groups})
                     for group in groups:
                         _muscle_group_map[group].append(exercise_name)
    except Exception as e:
        logger.error(f"Error loading exercises CSV for recommendations: {e}")
        _exercises_data = [] # Ensure it's an empty list on error
        _muscle_group_map = defaultdict(list)


def _get_alternative_exercise(exercise_name: str) -> Optional[str]:
    """Finds a different exercise targeting similar muscle groups."""
    _load_exercises_data()
    if not _exercises_data or not _muscle_group_map:
        return None

    target_groups = []
    for ex in _exercises_data:
        if ex['name'].lower() == exercise_name.lower():
            target_groups = ex['groups']
            break

    if not target_groups:
        return None

    # Find exercises sharing at least one primary muscle group
    candidates = []
    primary_group = target_groups[0] # Assume first listed is primary
    if primary_group in _muscle_group_map:
        for candidate_name in _muscle_group_map[primary_group]:
            if candidate_name.lower() != exercise_name.lower():
                candidates.append(candidate_name)

    if candidates:
        # Simple selection: return the first alternative found
        # More complex logic could prioritize based on equipment, etc.
        import random
        return random.choice(candidates)

    return None


def _calculate_volume(sets: int, reps: int, weight: float) -> float:
    """Calculates training volume. Use weight=1 for bodyweight."""
    # Treat 0 weight as bodyweight (assign weight of 1 for volume calc)
    effective_weight = weight if weight > 0 else 1
    return sets * reps * effective_weight

def _get_next_target(
    last_workout: Workout,
    intensity: TrainingIntensityLevels,
    goal: TrainingGoals,
    weight_unit: WeightUnits
) -> Dict:
    """Calculates the next target based on simple progressive overload."""
    target_reps_min, target_reps_max = REP_RANGES.get(goal, (8, 12)) # Default range if goal unknown
    rep_inc = REP_INCREMENT.get(intensity, 1)

    # Determine weight increment based on user's unit preference
    if weight_unit == WeightUnits.LB:
        weight_inc = WEIGHT_INCREMENT_LB.get(intensity, 5.0)
    else: # KG
        weight_inc = WEIGHT_INCREMENT_KG.get(intensity, 2.5)

    target_sets = last_workout.sets # Keep sets constant initially
    target_reps = last_workout.reps
    target_weight = last_workout.weight

    # Strategy: Prioritize adding reps within the target range, then increase weight.
    if target_reps < target_reps_max:
        # Increase reps if below max range
        target_reps += rep_inc
        target_reps = min(target_reps, target_reps_max) # Cap at max reps
        note = f"Aim for {target_reps} reps."
    else:
        # If at max reps, increase weight and reset reps towards lower end of range
        target_weight += weight_inc
        target_reps = target_reps_min # Reset reps
        note = f"Increase weight to ~{target_weight:.1f} {weight_unit.value}. Aim for {target_reps} reps."

    return {'sets': target_sets, 'reps': target_reps, 'weight': round(target_weight, 2), 'notes': note}


def calculate_recommendations(user_id: str) -> Dict:
    """
    Calculates workout recommendations for a user based on profile and history.
    """
    logger.info(f"Calculating recommendations for user_id: {user_id}")
    recommendations = {}

    user_info = get_userinfo_by_user(user_id)
    if not user_info:
        logger.warning(f"Cannot generate recommendations: User info not found for user {user_id}")
        return {'error': 'User profile data not found.'}

    all_workouts = get_workouts_by_user(user_id)
    if not all_workouts:
        logger.info(f"No workout history found for user {user_id}. No recommendations generated.")
        return {'message': 'Log your first workout to start receiving recommendations!'}

    # Group workouts by exercise name
    exercises_done = defaultdict(list)
    # Sort workouts by date first to process them chronologically within exercises
    all_workouts.sort(key=lambda w: w.date)
    for w in all_workouts:
        exercises_done[w.exercise].append(w)

    intensity = user_info.training_intensity
    goal = user_info.goal
    weight_unit = user_info.weight_unit

    for exercise, history in exercises_done.items():
        # Need at least two data points for comparison (as per user req Q7)
        if len(history) < 2:
            recommendations[exercise] = {'sets': history[-1].sets, 'reps': history[-1].reps, 'weight': history[-1].weight, 'notes': 'Log this exercise again to get first recommendation.'}
            continue

        # Analyze the last N sessions (up to PLATEAU_SESSIONS + 1)
        recent_sessions = history[- (PLATEAU_SESSIONS + 1):]
        last_workout = recent_sessions[-1]
        volumes = [_calculate_volume(w.sets, w.reps, w.weight) for w in recent_sessions]

        # Check for progress
        making_progress = False
        if len(volumes) >= 2:
            # Simple check: Did volume increase from the session before last to the last session?
            if volumes[-1] > volumes[-2] * (1 + PROGRESS_THRESHOLD):
                 making_progress = True

        # Check for plateau (only if enough sessions exist)
        is_plateau = False
        if not making_progress and len(volumes) >= PLATEAU_SESSIONS:
            # Check if volume hasn't increased meaningfully over the last PLATEAU_SESSIONS
            plateau_check_volumes = volumes[-PLATEAU_SESSIONS:]
            if all(plateau_check_volumes[i] <= plateau_check_volumes[0] * (1 + PROGRESS_THRESHOLD) for i in range(1, PLATEAU_SESSIONS)):
                 is_plateau = True

        # Generate Recommendation
        if is_plateau:
            logger.info(f"Plateau detected for user {user_id}, exercise {exercise}")
            # --- Plateau Strategy ---
            # Simple strategy: Suggest deload first, then alternative exercise if deload was suggested last time.
            # More complex logic could cycle through different suggestions.
            last_rec = recommendations.get(exercise, {}) # Check if previous rec was deload
            if last_rec.get('notes', '').startswith("Deload suggestion"):
                 alt_exercise = _get_alternative_exercise(exercise)
                 if alt_exercise:
                      recommendations[exercise] = {'sets': 3, 'reps': 10, 'weight': 0, 'notes': f"Plateau persists. Try an alternative exercise like '{alt_exercise}' focusing on good form."}
                 else:
                     # Fallback if no alternative found
                      recommendations[exercise] = {'sets': int(last_workout.sets * DELOAD_FACTOR) or 1,
                                                'reps': last_workout.reps,
                                                'weight': round(last_workout.weight * DELOAD_FACTOR, 2),
                                                'notes': f"Plateau persists & no alternative found. Consider reducing volume further or resting."}
            else:
                 # First time plateau detected: Suggest deload
                 target_sets = int(last_workout.sets * DELOAD_FACTOR) or 1 # Ensure at least 1 set
                 target_weight = round(last_workout.weight * DELOAD_FACTOR, 2)
                 recommendations[exercise] = {'sets': target_sets,
                                             'reps': last_workout.reps, # Keep reps same for simplicity
                                             'weight': target_weight,
                                             'notes': f"Plateau detected. Deload suggestion: Reduce weight to ~{target_weight:.1f} {weight_unit.value} for {target_sets} sets."}

        elif making_progress:
             logger.info(f"Progress detected for user {user_id}, exercise {exercise}")
             # Apply progressive overload
             recommendations[exercise] = _get_next_target(last_workout, intensity, goal, weight_unit)

        else: # Not plateau, but no progress in last session (e.g., only 2 sessions logged, second didn't increase)
             logger.info(f"No progress in last session for user {user_id}, exercise {exercise}. Recommending repeat or slight adjustment.")
             # Suggest repeating last workout or a very minor adjustment
             recommendations[exercise] = {'sets': last_workout.sets,
                                          'reps': last_workout.reps,
                                          'weight': last_workout.weight,
                                          'notes': f"Try repeating {last_workout.sets}x{last_workout.reps} at {last_workout.weight:.1f} {weight_unit.value}, focus on form."}


    logger.info(f"Generated {len(recommendations)} recommendations for user {user_id}")
    return recommendations