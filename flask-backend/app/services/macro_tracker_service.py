from datetime import datetime, timezone
import requests

from app.dao.macro_tracker_dao import (
    commit_changes,
    delete_tracker,
    get_tracker_by_id,
    get_tracker_records,
    insert_tracker,
)
from app.logging_config import logger

# API endpoint to look up nutrition info by barcode
OPEN_FOOD_FACTS = 'https://world.openfoodfacts.org/api/v0/product/{barcode}.json'


# Helper function to get macros from the Open Food Facts API
def _fetch_barcode_macros(barcode: str):
    url = OPEN_FOOD_FACTS.format(barcode=barcode)
    resp = requests.get(url)
    resp.raise_for_status()
    data = resp.json().get('product', {}).get('nutriments', {})
    return {
        'calories': data.get('energy-kcal_100g', 0),
        'protein': data.get('proteins_100g', 0),
        'unsat_fat': data.get('fat_100g', 0) - data.get('saturated-fat_100g', 0),
        'sat_fat': data.get('saturated-fat_100g', 0),
        'fiber': data.get('fiber_100g', 0),
        'carbs': data.get('carbohydrates_100g', 0),
    }


# Handles logging a food item for the current day
# If there's already an entry for today, we just add to it
def create_or_update_entry(user_id: int, payload: dict):
    today = datetime.now(timezone.utc).date()
    food_name = payload.get('food_name')
    macros = {k: payload.get(k) for k in ('calories', 'protein', 'unsat_fat', 'sat_fat', 'fiber', 'carbs')}

    # If a barcode is provided, try to fetch its macros
    if barcode := payload.get('barcode'):
        try:
            bc_macros = _fetch_barcode_macros(barcode)

            # Only fill in missing values with barcode data
            for k, v in bc_macros.items():
                macros[k] = macros[k] or v

            # Use the barcode as the food name if one wasn't given
            food_name = food_name or barcode
            logger.info(f'Fetched barcode data for user {user_id}')
        except Exception as e:
            logger.error(f'Barcode lookup failed for {barcode}: {e}')
            raise

    if not food_name:
        raise ValueError('Food name is required')

    # See if we already have a log for today
    today_rec = get_tracker_records(user_id, date=today)
    if today_rec:
        rec = today_rec[0]
        for k, v in macros.items():
            setattr(rec, k, getattr(rec, k) + (v or 0))  # Add new values to what's already saved
        logger.info(f'Updated tracker for user {user_id} on {today}')
    else:
        # Otherwise, create a new record
        rec = insert_tracker(user_id, today, food_name, {k: v or 0 for k, v in macros.items()})
        logger.info(f'Created tracker for user {user_id} on {today}')

    commit_changes()
    return rec


# Returns all tracker entries for a user (optionally for a specific date)
def list_entries(user_id: int, date=None):
    return get_tracker_records(user_id, date)


# Updates an existing tracker entry by ID
# Numerical fields (like calories) are added to, while text fields are replaced
def patch_entry(user_id: int, record_id: int, updates: dict):
    rec = get_tracker_by_id(user_id, record_id)
    if not rec:
        raise LookupError('Not found')

    numeric = {'calories', 'protein', 'carbs', 'fiber', 'unsat_fat', 'sat_fat'}
    for field, value in updates.items():
        if field in numeric:
            setattr(rec, field, getattr(rec, field) + (value or 0))
        elif field in {'food_name', 'barcode'}:
            setattr(rec, field, value)

    commit_changes()
    return rec


# Deletes a macro tracker entry for a user
def remove_entry(user_id: int, record_id: int):
    rec = get_tracker_by_id(user_id, record_id)
    if not rec:
        raise LookupError('Not found')
    delete_tracker(rec)
    commit_changes()
