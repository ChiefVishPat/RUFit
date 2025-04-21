import csv
import os
import random
from collections import defaultdict
from enum import Enum
from typing import Dict, List, Optional, Tuple

from app.dao.userinfo_dao import get_userinfo_by_user
from app.dao.workout_dao import get_workouts_by_user # Using get_workouts_by_user directly as it fetches all needed data
from app.logging_config import logger
from app.models.userinfo import TrainingGoals, TrainingIntensityLevels, WeightUnits
from app.models.workout import Workout

# --- Configuration Constants ---

PLATEAU_SESSIONS = 3  # Num sessions without progress threshold to detect a plateau.
PROGRESS_THRESHOLD = 0.02  # Min volume increase (2% rn) to be considered progress.

# Base weight increments (may be adjusted dynamically).
WEIGHT_INCREMENT_LB = {
    TrainingIntensityLevels.AMATEUR: 2.5,
    TrainingIntensityLevels.EXPERIENCED: 5.0,
    TrainingIntensityLevels.PROFESSIONAL: 5.0,
}
WEIGHT_INCREMENT_KG = {
    TrainingIntensityLevels.AMATEUR: 1.0,
    TrainingIntensityLevels.EXPERIENCED: 2.5,
    TrainingIntensityLevels.PROFESSIONAL: 2.5,
}
REP_INCREMENT = 1 # Standard rep increment when progressing reps.

DELOAD_FACTOR = 0.8 # Factor to reduce weight/volume for a deload session (80% of original).

# Target Rep Ranges based on Goals.
INITIAL_REP_RANGES = {
    TrainingGoals.SURPLUS: (4, 8),  # Start SURPLUS with strength focus.
    TrainingGoals.MAINTAIN: (8, 15),
    TrainingGoals.DEFICIT: (8, 15), # DEFICIT focuses on intensity maintenance.
}
HYPERTROPHY_REP_RANGE = (8, 12) # Secondary range for SURPLUS goal if strength focus stalls.

# --- Plateau Handling ---

class PlateauStrategy(Enum):
    """ Defines the different approaches to handle training plateaus. """
    REDUCE_WEIGHT_INC_REPS = "Reduce weight slightly, increase reps"
    HOLD_WEIGHT_DEC_REPS_ADD_SET = "Keep weight, lower reps/set, add a set"
    CHANGE_REP_RANGE = "Shift target rep range (e.g., to hypertrophy)"
    DELOAD = "Perform a deload session"
    SUGGEST_ALTERNATIVE = "Try an alternative exercise"
    NONE = "No specific strategy applied yet" # Initial state

# Order in which to cycle through plateau strategies if a plateau persists.
PLATEAU_STRATEGY_CYCLE = [
    PlateauStrategy.REDUCE_WEIGHT_INC_REPS,
    PlateauStrategy.HOLD_WEIGHT_DEC_REPS_ADD_SET,
    PlateauStrategy.CHANGE_REP_RANGE,
    PlateauStrategy.DELOAD,
    PlateauStrategy.SUGGEST_ALTERNATIVE,
]

# Stores the last applied plateau strategy for each exercise *during a single request*.
# helps cycle strategies if a plateau is detected consecutively.
_session_plateau_state: Dict[str, PlateauStrategy] = {}


# --- Exercise Data Handling ---

_exercises_data = None # In-memory cache for exercise details.
_muscle_group_map = None # In-memory map from muscle group to exercises.

def _load_exercises_data():
    """
    Loads exercise names and their associated muscle groups from the CSV file.
    Caches the data in memory to avoid repeated file reads during a request.
    Expected CSV columns: "Exercise Name", "Muscle Group(s)" (semicolon-separated).
    """
    global _exercises_data, _muscle_group_map
    if _exercises_data is not None: # Use cached data if available.
        return

    _exercises_data = []
    _muscle_group_map = defaultdict(list)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # Path relative to this service file's location.
    csv_path = os.path.join(current_dir, '..', 'data', 'exercises.csv')
    logger.debug(f"Attempting to load exercise data from: {csv_path}")

    try:
        with open(csv_path, 'r', newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            count = 0
            for row in reader:
                exercise_name = row.get('Exercise Name','').strip()
                muscle_groups_raw = row.get('Muscle Group(s)', '').strip()
                # Muscle groups are semicolon-separated in the provided CSV[cite: 3].
                groups = [group.strip().lower() for group in muscle_groups_raw.split(';') if group.strip()]

                if exercise_name and groups:
                     _exercises_data.append({'name': exercise_name, 'groups': groups})
                     for group in groups:
                         _muscle_group_map[group].append(exercise_name)
                     count += 1
            logger.info(f"Successfully loaded data for {count} exercises from CSV.")
            # Log loaded groups for debugging if needed: logger.debug(f"Loaded muscle groups: {_muscle_group_map.keys()}")
    except FileNotFoundError:
         logger.error(f"Exercises CSV file not found at calculated path: {csv_path}")
         _exercises_data = [] # Ensure empty list on error.
         _muscle_group_map = defaultdict(list)
    except Exception as e:
        logger.error(f"Error loading or parsing exercises CSV: {e}", exc_info=True)
        _exercises_data = []
        _muscle_group_map = defaultdict(list)


def _get_alternative_exercise(exercise_name: str) -> Optional[str]:
    """
    Suggests an alternative exercise targeting similar muscle groups.
    Prioritizes exercises sharing the primary muscle group.

    :param exercise_name: The name of the exercise the user is plateauing on.
    :return: The name of a suggested alternative exercise, or None if none found.
    """
    _load_exercises_data() # Ensure data is loaded.
    if not _exercises_data or not _muscle_group_map:
        logger.warning(f"Exercise data not available, cannot suggest alternatives for '{exercise_name}'")
        return None

    target_groups = []
    for ex in _exercises_data:
        if ex['name'].lower() == exercise_name.lower():
            target_groups = ex['groups']
            break

    if not target_groups:
        logger.warning(f"Muscle groups not found for '{exercise_name}' in loaded data.")
        return None

    candidates = set()
    primary_group = target_groups[0] # Assume first listed group is primary.

    # Add exercises targeting the primary group first.
    if primary_group in _muscle_group_map:
        for candidate_name in _muscle_group_map[primary_group]:
            # Ensure it's not the same exercise.
            if candidate_name.lower() != exercise_name.lower():
                candidates.add(candidate_name)

    # Add exercises targeting secondary groups if needed/available for more options.
    if len(target_groups) > 1:
        for group in target_groups[1:]:
             if group in _muscle_group_map:
                  for candidate_name in _muscle_group_map[group]:
                      if candidate_name.lower() != exercise_name.lower():
                          candidates.add(candidate_name)

    if candidates:
        selected = random.choice(list(candidates)) # Simple random selection.
        logger.info(f"Suggesting alternative '{selected}' for '{exercise_name}' (targets: {target_groups})")
        return selected
    else:
        logger.warning(f"No suitable alternative exercises found for '{exercise_name}' (targets: {target_groups})")
        return None

# --- Core Logic Helper Functions ---

def _calculate_volume(sets: int, reps: int, weight: float) -> float:
    """
    Calculates training volume (Sets * Reps * Weight).
    Treats weight <= 0 as bodyweight, assigning a multiplier of 1 for volume calculation.

    :param sets: Number of sets performed.
    :param reps: Number of reps performed per set.
    :param weight: Weight lifted (0 or less indicates bodyweight).
    :return: Calculated volume.
    """
    effective_weight = max(weight, 1.0) # Use 1.0 for bodyweight or zero weight exercises.
    return sets * reps * effective_weight

def _format_weight_string(weight: float, unit: WeightUnits) -> str:
    """ Formats weight for display, using 'Bodyweight' if weight is near zero. """
    if weight < 0.1: # Threshold to consider bodyweight.
        return "Bodyweight"
    else:
        return f"~{weight:.1f} {unit.value}"


def _get_next_target(
    last_workout: Workout,
    intensity: TrainingIntensityLevels,
    current_rep_range: Tuple[int, int],
    weight_unit: WeightUnits
) -> Dict:
    """
    Calculates the next target workout based on adaptive progressive overload.
    Prioritizes adding reps within the target range, then increases weight.
    Adjusts progression based on user's intensity level and position within rep range.

    :param last_workout: The user's last recorded workout object for this exercise.
    :param intensity: The user's self-reported training intensity level.
    :param current_rep_range: The target rep range (min, max) for the current goal/phase.
    :param weight_unit: The user's preferred weight unit (KG or LB).
    :return: A dictionary containing recommended 'sets', 'reps', 'weight', and 'notes'.
    """
    target_reps_min, target_reps_max = current_rep_range
    rep_inc = REP_INCREMENT

    # Determine base weight increment based on user's unit preference.
    if weight_unit == WeightUnits.LB:
        weight_inc = WEIGHT_INCREMENT_LB.get(intensity, 5.0)
    else: # KG
        weight_inc = WEIGHT_INCREMENT_KG.get(intensity, 2.5)

    target_sets = last_workout.sets # Keep sets constant for standard progression for now.
    target_reps = last_workout.reps
    target_weight = last_workout.weight

    # Adaptive Progression Strategy:
    if target_reps < target_reps_max:
        # 1. If reps are below max, prioritize adding reps.
        target_reps += rep_inc
        # Allow slight overshoot of max reps before forcing weight increase, avoids tiny weight jumps.
        target_reps = min(target_reps, target_reps_max + rep_inc // 2)
        weight_str = _format_weight_string(target_weight, weight_unit)
        note = f"Aim for {target_reps} reps at {weight_str}."

    else:
        # 2. If reps are at (or slightly over) max, attempt to increase weight.
        # Check if the standard increment is relatively large (>7.5% for non-amateurs).
        relative_increment = weight_inc / target_weight if target_weight > 0 else 0.1

        if intensity != TrainingIntensityLevels.AMATEUR and target_weight > 0 and relative_increment > 0.075:
            # 2a. Experienced user, large relative jump: Hold weight, push reps further.
            target_reps += rep_inc # Push past max temporarily.
            weight_str = _format_weight_string(target_weight, weight_unit)
            note = f"Good work hitting reps! Push for {target_reps} reps at {weight_str} if form is solid."
        else:
            # 2b. Standard weight increase: Increase weight, reset reps towards min range.
            target_weight += weight_inc
            target_reps = target_reps_min # Reset reps to bottom of target range.
            weight_str = _format_weight_string(target_weight, weight_unit)
            note = f"Increase weight to {weight_str}. Aim for {target_reps} reps."

    return {'sets': target_sets, 'reps': target_reps, 'weight': round(target_weight, 2), 'notes': note}


# --- Main Recommendation Calculation Function ---

def calculate_recommendations(user_id: str) -> Dict:
    """
    Calculates workout recommendations for a specific user.

    Fetches user profile and workout history, analyzes progress per exercise,
    detects plateaus, and applies adaptive progressive overload or plateau
    intervention strategies based on user goals and intensity level.

    :param user_id: The ID of the user requesting recommendations.
    :return: A dictionary where keys are exercise names and values are recommendation
             details ({'sets', 'reps', 'weight', 'notes'}), or an error/message dictionary.
    """
    global _session_plateau_state
    _session_plateau_state = {} # Reset temp state for each new request.

    logger.info(f"Calculating recommendations for user_id: {user_id}")
    recommendations = {} # Stores the final recommendations per exercise.

    # 1. Fetch User Profile Data
    user_info = get_userinfo_by_user(user_id)
    if not user_info:
        logger.warning(f"Cannot generate recommendations: User info not found for user {user_id}")
        return {'error': 'User profile data not found.'}
    intensity = user_info.training_intensity
    goal = user_info.goal
    weight_unit = user_info.weight_unit

    # 2. Fetch Workout History
    # Fetching all workouts once is efficient. We'll group them below.
    all_workouts = get_workouts_by_user(user_id)
    if not all_workouts:
        logger.info(f"No workout history found for user {user_id}. No recommendations generated.")
        return {'message': 'Log your first workout to start receiving recommendations!'}

    # 3. Group Workouts by Exercise
    exercises_done = defaultdict(list)
    all_workouts.sort(key=lambda w: w.date) # Ensure chronological order for analysis.
    for w in all_workouts:
        exercises_done[w.exercise].append(w)

    # --- 4. Process Each Logged Exercise ---
    for exercise, history in exercises_done.items():
        logger.debug(f"Processing exercise '{exercise}' for user {user_id}")

        # Need at least two data points for comparison (as per Q7 requirement).
        if len(history) < 2:
            last = history[-1]
            recommendations[exercise] = {
                'sets': last.sets, 'reps': last.reps, 'weight': last.weight,
                'notes': 'Log this exercise again to get your first recommendation.'
            }
            logger.debug(f"Only one log found for '{exercise}'. No recommendation generated yet.")
            continue

        # Analyze the last N sessions (up to PLATEAU_SESSIONS + 1 for comparison).
        recent_sessions = history[-(PLATEAU_SESSIONS + 1):]
        last_workout = recent_sessions[-1]
        volumes = [_calculate_volume(w.sets, w.reps, w.weight) for w in recent_sessions]

        # --- 5. Determine Current State: Progress, Plateau, or Stalled ---
        making_progress = False
        if len(volumes) >= 2:
            # Check if last session's volume increased sufficiently vs session before last.
            if volumes[-1] > volumes[-2] * (1 + PROGRESS_THRESHOLD):
                 making_progress = True

        is_plateau = False
        # Check for plateau only if not making progress AND enough sessions logged.
        sessions_for_plateau_check = min(len(volumes), PLATEAU_SESSIONS)
        if not making_progress and len(volumes) >= PLATEAU_SESSIONS:
            # Check if volume hasn't increased meaningfully over the defined plateau period.
            plateau_volumes = volumes[-sessions_for_plateau_check:]
            if plateau_volumes[-1] <= plateau_volumes[0] * (1 + PROGRESS_THRESHOLD):
                 is_plateau = True
                 logger.info(f"Plateau detected for user {user_id}, exercise '{exercise}'. Volumes: {plateau_volumes}")

        # --- 6. Determine Target Rep Range for This Exercise ---
        # Start with goal default, but allow potential adaptation (e.g., for SURPLUS).
        current_rep_range = INITIAL_REP_RANGES.get(goal, HYPERTROPHY_REP_RANGE) # Default to hypertrophy if goal unknown.
        # (Future enhancement: Check history/state to see if rep range *was* changed previously).

        # --- 7. Generate Recommendation Based on State ---
        rec = {} # Holds the recommendation for the current exercise.

        if is_plateau:
            # --- Apply Plateau Strategy ---
            last_strategy = _session_plateau_state.get(exercise, PlateauStrategy.NONE)
            next_strategy = PlateauStrategy.NONE

            # Find the next strategy in the defined cycle.
            try:
                current_index = PLATEAU_STRATEGY_CYCLE.index(last_strategy) if last_strategy != PlateauStrategy.NONE else -1
                next_index = (current_index + 1) % len(PLATEAU_STRATEGY_CYCLE)
                next_strategy = PLATEAU_STRATEGY_CYCLE[next_index]
                logger.debug(f"Plateau cycle for '{exercise}': Last={last_strategy.name}, Next={next_strategy.name}")
            except ValueError: # Should not happen if enums are correct.
                 logger.warning(f"Unknown last plateau strategy '{last_strategy}' for '{exercise}'. Starting cycle over.")
                 next_strategy = PLATEAU_STRATEGY_CYCLE[0]

            # Apply the selected strategy logic.
            applied_strategy = True # Flag to track if the selected strategy was usable.
            if next_strategy == PlateauStrategy.REDUCE_WEIGHT_INC_REPS:
                target_weight = round(last_workout.weight * 0.95, 2) # Modest 5% weight reduction.
                target_reps = current_rep_range[1] # Aim for top of rep range with lighter weight.
                weight_str = _format_weight_string(target_weight, weight_unit)
                rec = {'sets': last_workout.sets, 'reps': target_reps, 'weight': target_weight,
                       'notes': f"Plateau Strategy: Try reducing weight to {weight_str} and aim for {target_reps} reps."}

            elif next_strategy == PlateauStrategy.HOLD_WEIGHT_DEC_REPS_ADD_SET:
                target_reps = current_rep_range[0] # Aim for bottom of rep range.
                target_sets = last_workout.sets + 1 # Add a set.
                weight_str = _format_weight_string(last_workout.weight, weight_unit)
                rec = {'sets': target_sets, 'reps': target_reps, 'weight': last_workout.weight,
                       'notes': f"Plateau Strategy: Keep weight at {weight_str}, but do {target_sets} sets aiming for {target_reps} reps."}

            elif next_strategy == PlateauStrategy.CHANGE_REP_RANGE:
                # Only if goal is SURPLUS and currently in strength range.
                if goal == TrainingGoals.SURPLUS and current_rep_range == INITIAL_REP_RANGES[TrainingGoals.SURPLUS]:
                    current_rep_range = HYPERTROPHY_REP_RANGE # Switch to hypertrophy focus.
                    target_reps = current_rep_range[0] # Start at bottom of new range.
                    weight_str = _format_weight_string(last_workout.weight, weight_unit)
                    rec = {'sets': last_workout.sets, 'reps': target_reps, 'weight': last_workout.weight,
                           'notes': f"Plateau Strategy: Let's switch focus. Aim for {target_reps} reps in the {current_rep_range[0]}-{current_rep_range[1]} range at {weight_str}."}
                    # Note: We changed current_rep_range *only* for this recommendation generation.
                    # Persistent change would require storing state.
                else:
                    applied_strategy = False # Cannot apply this strategy.

            elif next_strategy == PlateauStrategy.DELOAD:
                 target_sets = max(1, int(last_workout.sets * DELOAD_FACTOR)) # Ensure at least 1 set.
                 target_weight = round(last_workout.weight * DELOAD_FACTOR, 2)
                 weight_str = _format_weight_string(target_weight, weight_unit)
                 rec = {'sets': target_sets, 'reps': last_workout.reps, 'weight': target_weight, # Keep reps same during deload for simplicity.
                        'notes': f"Plateau Strategy: Time for a deload. Reduce to {weight_str} for {target_sets} sets of {last_workout.reps} reps."}

            elif next_strategy == PlateauStrategy.SUGGEST_ALTERNATIVE:
                alt_exercise = _get_alternative_exercise(exercise)
                if alt_exercise:
                    # Suggest starting parameters for the new exercise.
                    rec = {'sets': 3, 'reps': 10, 'weight': 0,
                           'notes': f"Plateau persists. Strategy: Try an alternative exercise like '{alt_exercise}' focusing on good form (e.g., 3 sets of 10)."}
                else:
                    applied_strategy = False # No alternative found.

            # Fallback if a strategy wasn't applicable (e.g., change rep range for non-surplus goal).
            if not applied_strategy:
                 logger.warning(f"Plateau strategy {next_strategy.name} not applicable for '{exercise}'. Applying Deload as fallback.")
                 # Default fallback is deload.
                 target_sets = max(1, int(last_workout.sets * DELOAD_FACTOR))
                 target_weight = round(last_workout.weight * DELOAD_FACTOR, 2)
                 weight_str = _format_weight_string(target_weight, weight_unit)
                 rec = {'sets': target_sets, 'reps': last_workout.reps, 'weight': target_weight,
                        'notes': f"Plateau Strategy Fallback: Deload. Reduce to {weight_str} for {target_sets} sets."}
                 next_strategy = PlateauStrategy.DELOAD # Ensure state reflects deload was applied.

            _session_plateau_state[exercise] = next_strategy # Store the applied strategy for this session.
            recommendations[exercise] = rec

        elif making_progress:
            # --- Apply Adaptive Progressive Overload ---
            logger.info(f"Progress detected for user {user_id}, exercise '{exercise}'")
            # Use the determined rep range for the next target calculation.
            recommendations[exercise] = _get_next_target(last_workout, intensity, current_rep_range, weight_unit)

        else:
            # --- Stalled (Not plateau yet, but no progress last session) ---
            logger.info(f"Stalled (no progress) last session for user {user_id}, exercise '{exercise}'. Recommending repeat/focus.")
            weight_str = _format_weight_string(last_workout.weight, weight_unit)
            recommendations[exercise] = {
                'sets': last_workout.sets,
                'reps': last_workout.reps,
                'weight': last_workout.weight,
                'notes': f"Repeat {last_workout.sets}x{last_workout.reps} at {weight_str}. Focus on excellent technique or consider a slightly longer rest between sets."
            }

    logger.info(f"Finished calculating recommendations for user {user_id}. Generated {len(recommendations)} recommendations.")
    return recommendations