import random
from collections import defaultdict
from enum import Enum
from typing import Dict, NamedTuple, Optional, Tuple

from app.dao.userinfo_dao import get_userinfo_by_user
from app.dao.workout_dao import get_workouts_by_user
from app.logging_config import logger
from app.models.userinfo import (
    GenderChoices,
    HeightUnits,
    TrainingGoals,
    TrainingIntensityLevels,
    Userinfo,
    WeightUnits,
)
from app.models.workout import Workout
from app.routes.exercises import exercises as loaded_exercises_list  # Use data loaded at startup

# from app.tools import unit_conversion

# --- Configuration Constants ---

PLATEAU_SESSIONS = 3  # Num sessions without progress threshold to detect a plateau.
PROGRESS_THRESHOLD = 0.02  # Min volume increase (e.g., 2%) to be considered progress.
REP_INCREMENT = 1  # Standard rep increment when progressing reps.
DELOAD_FACTOR = 0.8  # Factor to reduce weight/volume for a deload session (e.g., 80%).

# Base weight increments per intensity level (adjusted by profile class factor below).
BASE_WEIGHT_INCREMENT_LB = {
    TrainingIntensityLevels.AMATEUR: 2.5,
    TrainingIntensityLevels.EXPERIENCED: 5.0,
    TrainingIntensityLevels.PROFESSIONAL: 5.0,
}
BASE_WEIGHT_INCREMENT_KG = {
    TrainingIntensityLevels.AMATEUR: 1.0,
    TrainingIntensityLevels.EXPERIENCED: 2.5,
    TrainingIntensityLevels.PROFESSIONAL: 2.5,
}

# Target Rep Ranges based on Goals.
INITIAL_REP_RANGES = {TrainingGoals.SURPLUS: (4, 8), TrainingGoals.MAINTAIN: (8, 15), TrainingGoals.DEFICIT: (8, 15)}
HYPERTROPHY_REP_RANGE = (8, 12)  # Secondary range for SURPLUS goal if strength focus stalls.

# --- Profile Classification ---


class BMICategory(Enum):
    UNDERWEIGHT = 'Underweight'
    NORMAL = 'Normal'
    OVERWEIGHT = 'Overweight'
    OBESE = 'Obese'
    UNKNOWN = 'Unknown'


class UserProfileClass(NamedTuple):  # Represents the derived user class
    bmi_category: BMICategory
    gender: GenderChoices


# adjustment factors for weight increments based on profile class. Tune as needed.
PROFILE_PROGRESSION_FACTOR = {
    # Defaults defined first
    (BMICategory.UNKNOWN, GenderChoices.MALE): 1.0,
    (BMICategory.UNKNOWN, GenderChoices.FEMALE): 0.8,
    (BMICategory.UNKNOWN, GenderChoices.OTHER): 1.0,
    (BMICategory.NORMAL, GenderChoices.OTHER): 1.0,
    # Males by BMI
    (BMICategory.UNDERWEIGHT, GenderChoices.MALE): 0.9,
    (BMICategory.NORMAL, GenderChoices.MALE): 1.0,
    (BMICategory.OVERWEIGHT, GenderChoices.MALE): 0.9,
    (BMICategory.OBESE, GenderChoices.MALE): 0.9,
    # Females by BMI
    (BMICategory.UNDERWEIGHT, GenderChoices.FEMALE): 0.9,
    (BMICategory.NORMAL, GenderChoices.FEMALE): 0.9,
    (BMICategory.OVERWEIGHT, GenderChoices.FEMALE): 0.9,
    (BMICategory.OBESE, GenderChoices.FEMALE): 0.85,
}

# --- Plateau Handling ---


class PlateauStrategy(Enum):  # Defines plateau handling approaches
    REDUCE_WEIGHT_INC_REPS = 'Reduce weight slightly, increase reps'
    HOLD_WEIGHT_DEC_REPS_ADD_SET = 'Keep weight, lower reps/set, add a set'
    CHANGE_REP_RANGE = 'Shift target rep range (e.g., to hypertrophy)'
    DELOAD = 'Perform a deload session'
    SUGGEST_ALTERNATIVE = 'Try an alternative exercise'
    NONE = 'No specific strategy applied yet'


PLATEAU_STRATEGY_CYCLE = [
    PlateauStrategy.REDUCE_WEIGHT_INC_REPS,
    PlateauStrategy.HOLD_WEIGHT_DEC_REPS_ADD_SET,
    PlateauStrategy.CHANGE_REP_RANGE,
    PlateauStrategy.DELOAD,
    PlateauStrategy.SUGGEST_ALTERNATIVE,
]
_session_plateau_state: Dict[str, PlateauStrategy] = {}  # Tracks strategies applied within a single request


# --- Helper Functions ---


def _get_alternative_exercise(exercise_name: str) -> Optional[str]:
    """Suggests an alternative exercise using the globally loaded exercise list."""
    if not loaded_exercises_list:
        logger.warning('Globally loaded exercise list is empty. Cannot suggest alternatives.')
        # Attempt to trigger loading if possible? Or rely on startup load.
        # from app.routes.exercises import load_exercises_from_csv
        # try: load_exercises_from_csv() # Avoid this if it causes issues with Flask context
        # except Exception as e: logger.error(f"Failed to dynamically load exercises: {e}")
        # if not loaded_exercises_list: return None # Still empty
        return None  # Rely on exercises.py loading at startup

    # Build a temporary muscle group map from the loaded list for efficient lookup
    temp_muscle_group_map = defaultdict(list)
    target_groups = []
    exercise_found = False
    for ex_data in loaded_exercises_list:
        current_ex_name = ex_data.get('exercise_name', '')
        current_groups = ex_data.get('muscle_groups', [])
        # Map all exercises by their groups
        for group in current_groups:
            temp_muscle_group_map[group.lower()].append(current_ex_name)
        # Find the target exercise's groups
        if current_ex_name.lower() == exercise_name.lower():
            target_groups = [g.lower() for g in current_groups]
            exercise_found = True

    if not exercise_found:
        logger.warning(f"Target exercise '{exercise_name}' not found in loaded exercise list.")
        return None
    if not target_groups:
        logger.warning(f"Muscle groups not found for '{exercise_name}' in loaded data.")
        return None

    candidates = set()
    primary_group = target_groups[0]  # Assume first listed group is primary
    if primary_group in temp_muscle_group_map:
        for candidate_name in temp_muscle_group_map[primary_group]:
            if candidate_name.lower() != exercise_name.lower():
                candidates.add(candidate_name)
    if len(target_groups) > 1:  # Check secondary groups
        for group in target_groups[1:]:
            if group in temp_muscle_group_map:
                for candidate_name in temp_muscle_group_map[group]:
                    if candidate_name.lower() != exercise_name.lower():
                        candidates.add(candidate_name)

    if candidates:
        selected = random.choice(list(candidates))
        logger.info(f"Suggesting alternative '{selected}' for '{exercise_name}' (targets: {target_groups})")
        return selected
    else:
        logger.warning(f"No suitable alternative exercises found for '{exercise_name}' (targets: {target_groups})")
        return None


def _get_user_profile_class(user_info: Userinfo) -> UserProfileClass:
    """Calculates BMI and determines a profile class based on BMI category and gender."""
    try:
        weight_kg: Optional[float] = None
        if user_info.weight_unit == WeightUnits.LB and user_info.weight is not None:
            weight_kg = user_info.weight / 2.20462
        elif user_info.weight_unit == WeightUnits.KG and user_info.weight is not None:
            weight_kg = user_info.weight
        else:
            raise ValueError(f'Invalid weight unit or value: {user_info.weight} {user_info.weight_unit}')

        height_m: Optional[float] = None
        if (
            user_info.height_unit == HeightUnits.US
            and user_info.height_ft is not None
            and user_info.height_in is not None
        ):
            total_inches = (user_info.height_ft * 12) + user_info.height_in
            height_m = total_inches * 0.0254
        elif (
            user_info.height_unit == HeightUnits.SI and user_info.height_ft is not None
        ):  # Assuming SI height stored in cm in height_ft
            if user_info.height_ft > 0:
                height_m = user_info.height_ft / 100.0
            else:
                raise ValueError('Invalid height value for SI unit (assuming cm)')
        else:
            raise ValueError(f'Invalid height unit or value: {user_info.height_unit}')

        if weight_kg is None or height_m is None or height_m <= 0 or weight_kg <= 0:
            raise ValueError('Invalid weight or height for BMI calculation')

        bmi = weight_kg / (height_m**2)
        if bmi < 18.5:
            bmi_category = BMICategory.UNDERWEIGHT
        elif 18.5 <= bmi < 25:
            bmi_category = BMICategory.NORMAL
        elif 25 <= bmi < 30:
            bmi_category = BMICategory.OVERWEIGHT
        else:
            bmi_category = BMICategory.OBESE

        logger.debug(
            f'User {user_info.user_id}: BMI={bmi:.2f}, Category={bmi_category.name}, Gender={user_info.gender.name}'
        )
        return UserProfileClass(bmi_category=bmi_category, gender=user_info.gender)
    except Exception as e:
        logger.error(f'Error calculating profile class for user {user_info.user_id}: {e}')
        return UserProfileClass(bmi_category=BMICategory.UNKNOWN, gender=user_info.gender)  # Fallback


def _calculate_volume(sets: int, reps: int, weight: float) -> float:
    effective_weight = max(weight, 1.0)  # Use 1.0 for bodyweight/zero weight
    return sets * reps * effective_weight


def _format_weight_string(weight: float, unit: WeightUnits) -> str:
    if weight < 0.1:
        return 'Bodyweight'  # Threshold handles potential float inaccuracies
    else:
        return f'~{weight:.1f} {unit.value}'


def _get_next_target(
    last_workout: Workout,
    intensity: TrainingIntensityLevels,
    profile_class: UserProfileClass,
    current_rep_range: Tuple[int, int],
    weight_unit: WeightUnits,
) -> Dict:
    """Calculates next target, applying adjustment factor based on profile class."""
    target_reps_min, target_reps_max = current_rep_range
    rep_inc = REP_INCREMENT

    # Determine BASE weight increment
    if weight_unit == WeightUnits.LB:
        base_weight_inc = BASE_WEIGHT_INCREMENT_LB.get(intensity, 5.0)
    else:
        base_weight_inc = BASE_WEIGHT_INCREMENT_KG.get(intensity, 2.5)

    # Apply profile class adjustment factor
    profile_key = (profile_class.bmi_category, profile_class.gender)
    fallback_key = (BMICategory.NORMAL, profile_class.gender)  # Fallback if BMI unknown
    adjustment_factor = PROFILE_PROGRESSION_FACTOR.get(profile_key, PROFILE_PROGRESSION_FACTOR.get(fallback_key, 1.0))
    adjusted_weight_inc = base_weight_inc * adjustment_factor

    target_sets = last_workout.sets
    target_reps = last_workout.reps
    target_weight = last_workout.weight

    # Adaptive Progression Strategy
    if target_reps < target_reps_max:
        # 1. Prioritize adding reps
        target_reps += rep_inc
        target_reps = min(target_reps, target_reps_max + rep_inc // 2)  # Allow slight overshoot
        weight_str = _format_weight_string(target_weight, weight_unit)
        note = f'Aim for {target_reps} reps at {weight_str}.'
    else:
        # 2. Attempt weight increase
        relative_increment = adjusted_weight_inc / target_weight if target_weight > 0 else 0.1
        # Check relative jump size only for non-amateurs
        if intensity != TrainingIntensityLevels.AMATEUR and target_weight > 0 and relative_increment > 0.075:
            # 2a. Experienced, large relative jump: Hold weight, push reps
            target_reps += rep_inc
            weight_str = _format_weight_string(target_weight, weight_unit)
            note = f'Good work hitting reps! Push for {target_reps} reps at {weight_str} if form is solid.'
        else:
            # 2b. Standard (adjusted) weight increase
            target_weight += adjusted_weight_inc
            target_reps = target_reps_min
            weight_str = _format_weight_string(target_weight, weight_unit)
            note = f'Increase weight to {weight_str}. Aim for {target_reps} reps.'

    return {'sets': target_sets, 'reps': target_reps, 'weight': round(target_weight, 2), 'notes': note}


# --- Main Recommendation Calculation Function ---


def calculate_recommendations(user_id: str) -> Dict:
    """
    Calculates workout recommendations for a user.

    Analyzes progress per exercise using workout history and applies adaptive
    progressive overload or plateau intervention strategies based on user goals,
    intensity level, and profile class (derived from BMI & gender).

    :param user_id: The ID of the user requesting recommendations.
    :return: Dictionary mapping exercise names to recommendation details,
             or an error/message dict.
    """
    global _session_plateau_state
    _session_plateau_state = {}

    logger.info(f'Calculating recommendations for user_id: {user_id}')
    recommendations = {}

    # 1. Fetch User Profile & Calculate Class
    user_info = get_userinfo_by_user(user_id)
    if not user_info:
        logger.warning(f'Cannot generate recommendations: User info not found for user {user_id}')
        return {'error': 'User profile data not found.'}
    intensity = user_info.training_intensity
    goal = user_info.goal
    weight_unit = user_info.weight_unit
    profile_class = _get_user_profile_class(user_info)  # Class incorporates BMI & gender

    # 2. Fetch & Sort Workout History
    all_workouts = get_workouts_by_user(user_id)
    if not all_workouts:
        logger.info(f'No workout history found for user {user_id}.')
        return {'message': 'Log your first workout to start receiving recommendations!'}
    all_workouts.sort(key=lambda w: w.date)

    # 3. Group Workouts by Exercise
    exercises_done = defaultdict(list)
    for w in all_workouts:
        exercises_done[w.exercise].append(w)

    # --- 4. Process Each Logged Exercise ---
    for exercise, history in exercises_done.items():
        # Need >1 session to recommend based on progress
        if len(history) < 2:
            last = history[-1]
            recommendations[exercise] = {
                'sets': last.sets,
                'reps': last.reps,
                'weight': last.weight,
                'notes': 'Log this exercise again to get your first recommendation.',
            }
            continue

        # Analyze recent history
        recent_sessions = history[-(PLATEAU_SESSIONS + 1) :]
        last_workout = recent_sessions[-1]
        volumes = [_calculate_volume(w.sets, w.reps, w.weight) for w in recent_sessions]

        # --- 5. Determine Current State ---
        making_progress = len(volumes) >= 2 and volumes[-1] > volumes[-2] * (1 + PROGRESS_THRESHOLD)
        is_plateau = False
        if not making_progress and len(volumes) >= PLATEAU_SESSIONS:
            plateau_volumes = volumes[-min(len(volumes), PLATEAU_SESSIONS) :]
            if plateau_volumes[-1] <= plateau_volumes[0] * (1 + PROGRESS_THRESHOLD):
                is_plateau = True

        # --- 6. Determine Target Rep Range ---
        current_rep_range = INITIAL_REP_RANGES.get(goal, HYPERTROPHY_REP_RANGE)

        # --- 7. Generate Recommendation Based on State ---
        rec = {}
        if is_plateau:
            logger.info(f"Plateau detected for user {user_id}, exercise '{exercise}'.")
            # Apply next strategy from PLATEAU_STRATEGY_CYCLE
            last_strategy = _session_plateau_state.get(exercise, PlateauStrategy.NONE)
            next_strategy = PLATEAU_STRATEGY_CYCLE[0]  # Default start
            try:
                current_index = (
                    PLATEAU_STRATEGY_CYCLE.index(last_strategy) if last_strategy != PlateauStrategy.NONE else -1
                )
                next_index = (current_index + 1) % len(PLATEAU_STRATEGY_CYCLE)
                next_strategy = PLATEAU_STRATEGY_CYCLE[next_index]
            except ValueError:
                logger.warning(f"Unknown plateau strategy '{last_strategy}'. Starting cycle.")

            applied_strategy = True  # Assume applicable unless check fails
            # (Plateau strategy application logic is unchanged internally)
            if next_strategy == PlateauStrategy.REDUCE_WEIGHT_INC_REPS:
                target_weight = round(last_workout.weight * 0.95, 2)
                target_reps = current_rep_range[1]
                weight_str = _format_weight_string(target_weight, weight_unit)
                rec = {
                    'sets': last_workout.sets,
                    'reps': target_reps,
                    'weight': target_weight,
                    'notes': f'Plateau Strategy: Try reducing weight to {weight_str} and aim for {target_reps} reps.',
                }
            elif next_strategy == PlateauStrategy.HOLD_WEIGHT_DEC_REPS_ADD_SET:
                target_reps = current_rep_range[0]
                target_sets = last_workout.sets + 1
                weight_str = _format_weight_string(last_workout.weight, weight_unit)
                rec = {
                    'sets': target_sets,
                    'reps': target_reps,
                    'weight': last_workout.weight,
                    'notes': f'Plateau Strategy: Keep weight at {weight_str}, but do {target_sets} sets aiming for {target_reps} reps.',
                }
            elif next_strategy == PlateauStrategy.CHANGE_REP_RANGE:
                if goal == TrainingGoals.SURPLUS and current_rep_range == INITIAL_REP_RANGES[TrainingGoals.SURPLUS]:
                    crr = HYPERTROPHY_REP_RANGE
                    target_reps = crr[0]
                    weight_str = _format_weight_string(last_workout.weight, weight_unit)
                    rec = {
                        'sets': last_workout.sets,
                        'reps': target_reps,
                        'weight': last_workout.weight,
                        'notes': f"Plateau Strategy: Let's switch focus. Aim for {target_reps} reps in the {crr[0]}-{crr[1]} range at {weight_str}.",
                    }
                else:
                    applied_strategy = False
            elif next_strategy == PlateauStrategy.DELOAD:
                target_sets = max(1, int(last_workout.sets * DELOAD_FACTOR))
                target_weight = round(last_workout.weight * DELOAD_FACTOR, 2)
                weight_str = _format_weight_string(target_weight, weight_unit)
                rec = {
                    'sets': target_sets,
                    'reps': last_workout.reps,
                    'weight': target_weight,
                    'notes': f'Plateau Strategy: Time for a deload. Reduce to {weight_str} for {target_sets} sets of {last_workout.reps} reps.',
                }
            elif next_strategy == PlateauStrategy.SUGGEST_ALTERNATIVE:
                alt_exercise = _get_alternative_exercise(exercise)
                if alt_exercise:
                    rec = {
                        'sets': 3,
                        'reps': 10,
                        'weight': 0,
                        'notes': f"Plateau persists. Strategy: Try an alternative exercise like '{alt_exercise}' (e.g., 3 sets of 10).",
                    }
                else:
                    applied_strategy = False

            if not applied_strategy:  # Fallback
                target_sets = max(1, int(last_workout.sets * DELOAD_FACTOR))
                target_weight = round(last_workout.weight * DELOAD_FACTOR, 2)
                weight_str = _format_weight_string(target_weight, weight_unit)
                rec = {
                    'sets': target_sets,
                    'reps': last_workout.reps,
                    'weight': target_weight,
                    'notes': f'Plateau Strategy Fallback: Deload. Reduce to {weight_str} for {target_sets} sets.',
                }
                next_strategy = PlateauStrategy.DELOAD
            _session_plateau_state[exercise] = next_strategy
            recommendations[exercise] = rec

        elif making_progress:
            # Apply Adaptive Progressive Overload (now uses profile_class)
            logger.info(f"Progress detected for user {user_id}, exercise '{exercise}'")
            recommendations[exercise] = _get_next_target(
                last_workout, intensity, profile_class, current_rep_range, weight_unit
            )

        else:  # Stalled
            logger.info(f"Stalled last session for user {user_id}, exercise '{exercise}'.")
            weight_str = _format_weight_string(last_workout.weight, weight_unit)
            recommendations[exercise] = {
                'sets': last_workout.sets,
                'reps': last_workout.reps,
                'weight': last_workout.weight,
                'notes': f'Repeat {last_workout.sets}x{last_workout.reps} at {weight_str}. Focus on excellent technique.',
            }

    logger.info(f'Finished calculating recommendations for user {user_id}.')
    return recommendations
