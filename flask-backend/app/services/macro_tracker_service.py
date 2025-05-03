import datetime

import requests

from app.dao.macro_tracker_dao import (
    commit_changes,
    delete_tracker,
    get_tracker_by_id,
    get_tracker_records,
    insert_tracker,
)
from app.logging_config import logger

OPEN_FOOD_FACTS = 'https://world.openfoodfacts.org/api/v0/product/{barcode}.json'


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


def create_or_update_entry(user_id: int, payload: dict):
    today = datetime.datetime.utcnow().date()
    food_name = payload.get('food_name')
    macros = {k: payload.get(k) for k in ('calories', 'protein', 'unsat_fat', 'sat_fat', 'fiber', 'carbs')}

    if barcode := payload.get('barcode'):
        try:
            bc_macros = _fetch_barcode_macros(barcode)
            # fill in any missing fields
            for k, v in bc_macros.items():
                macros[k] = macros[k] or v
            food_name = food_name or barcode
            logger.info(f'Fetched barcode data for user {user_id}')
        except Exception as e:
            logger.error(f'Barcode lookup failed for {barcode}: {e}')
            raise

    if not food_name:
        raise ValueError('Food name is required')

    today_rec = get_tracker_records(user_id, date=today)
    if today_rec:
        rec = today_rec[0]
        for k, v in macros.items():
            setattr(rec, k, getattr(rec, k) + (v or 0))
        logger.info(f'Updated tracker for user {user_id} on {today}')
    else:
        rec = insert_tracker(user_id, today, food_name, {k: v or 0 for k, v in macros.items()})
        logger.info(f'Created tracker for user {user_id} on {today}')

    commit_changes()
    return rec


def list_entries(user_id: int, date=None):
    return get_tracker_records(user_id, date)


def patch_entry(user_id: int, record_id: int, updates: dict):
    rec = get_tracker_by_id(user_id, record_id)
    if not rec:
        raise LookupError('Not found')
    for field in ('food_name', 'barcode', 'calories', 'protein', 'carbs', 'fiber', 'unsat_fat', 'sat_fat'):
        if field in updates:
            setattr(rec, field, updates[field])
    commit_changes()
    return rec


def remove_entry(user_id: int, record_id: int):
    rec = get_tracker_by_id(user_id, record_id)
    if not rec:
        raise LookupError('Not found')
    delete_tracker(rec)
    commit_changes()
