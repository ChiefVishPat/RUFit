from datetime import datetime, timezone

import pytest
import requests
from app.models.macro_tracker import Tracker
from app.services.macro_tracker_service import (
    _fetch_barcode_macros,
    create_or_update_entry,
    patch_entry,
    remove_entry,
)


@pytest.fixture
def sample_payload():
    return {
        'food_name': 'TestFood',
        'calories': 100,
        'protein': 10,
        'unsat_fat': 5,
        'sat_fat': 2,
        'fiber': 3,
        'carbs': 20,
        'barcode': None,
    }


class DummyRec:
    def __init__(self, user_id, date, food_name, macros):
        self.user_id = user_id
        self.date = date
        self.food_name = food_name
        for k, v in macros.items():
            setattr(self, k, v)


def test__fetch_barcode_macros_success(mocker):
    fake = {
        'product': {
            'nutriments': {
                'energy-kcal_100g': 10,
                'proteins_100g': 2,
                'fat_100g': 5,
                'saturated-fat_100g': 1,
                'fiber_100g': 3,
                'carbohydrates_100g': 4,
            }
        }
    }
    mocker.patch.object(
        requests,
        'get',
        return_value=type(
            'R',
            (),
            {
                'raise_for_status': lambda s: None,
                'json': lambda s: fake,
            },
        )(),
    )
    out = _fetch_barcode_macros('123')
    assert out == {
        'calories': 10,
        'protein': 2,
        'unsat_fat': 4,  # 5-1
        'sat_fat': 1,
        'fiber': 3,
        'carbs': 4,
    }


def test_create_or_update_entry_creates_new(mocker, sample_payload):
    today = datetime.now(timezone.utc).date()
    mocker.patch('app.services.macro_tracker_service.get_tracker_records', return_value=[])
    dummy = DummyRec(1, today, sample_payload['food_name'], sample_payload)
    mocker.patch('app.services.macro_tracker_service.insert_tracker', return_value=dummy)
    spy = mocker.patch('app.services.macro_tracker_service.commit_changes')

    rec = create_or_update_entry(1, sample_payload)
    assert rec is dummy
    assert spy.called


def test_create_or_update_entry_updates_existing(mocker, sample_payload):
    today = datetime.now(timezone.utc).date()
    existing = DummyRec(
        1, today, 'Old', {'calories': 50, 'protein': 5, 'unsat_fat': 2, 'sat_fat': 1, 'fiber': 1, 'carbs': 10}
    )
    mocker.patch('app.services.macro_tracker_service.get_tracker_records', return_value=[existing])
    spy = mocker.patch('app.services.macro_tracker_service.commit_changes')

    rec = create_or_update_entry(1, sample_payload)
    assert existing.calories == 150
    assert existing.protein == 15
    assert rec is existing
    assert spy.called


def test_create_or_update_entry_missing_name_raises():
    with pytest.raises(ValueError):
        create_or_update_entry(1, {'calories': 0, 'protein': 0, 'unsat_fat': 0, 'sat_fat': 0, 'fiber': 0, 'carbs': 0})


def test_create_or_update_entry_with_barcode_fetch(mocker, sample_payload):
    payload = {**sample_payload, 'food_name': '', 'barcode': '999'}
    macros = {'calories': 1, 'protein': 1, 'unsat_fat': 0, 'sat_fat': 0, 'fiber': 0, 'carbs': 0}
    mocker.patch('app.services.macro_tracker_service._fetch_barcode_macros', return_value=macros)
    mocker.patch('app.services.macro_tracker_service.get_tracker_records', return_value=[])
    dummy = DummyRec(1, datetime.now(timezone.utc).date(), '999', macros)
    mocker.patch('app.services.macro_tracker_service.insert_tracker', return_value=dummy)
    spy = mocker.patch('app.services.macro_tracker_service.commit_changes')

    rec = create_or_update_entry(1, payload)
    assert rec is dummy
    assert rec.food_name == '999'
    assert spy.called


def test_patch_entry_and_remove_entry(mocker):
    rec = Tracker(
        user_id=2,
        date=datetime.now(timezone.utc).date(),
        food_name='A',
        calories=1,
        protein=1,
        carbs=1,
        fiber=1,
        unsat_fat=1,
        sat_fat=1,
    )
    # patch_entry success
    mocker.patch('app.services.macro_tracker_service.get_tracker_by_id', return_value=rec)
    spy_commit = mocker.patch('app.services.macro_tracker_service.commit_changes')
    out = patch_entry(2, rec.id, {'food_name': 'Z', 'calories': 5})
    assert out.food_name == 'Z'
    assert out.calories == 6
    assert spy_commit.called

    # remove_entry success
    spy_delete = mocker.patch('app.services.macro_tracker_service.delete_tracker')
    remove_entry(2, rec.id)
    assert spy_delete.called


def test_patch_entry_not_found(mocker):
    mocker.patch('app.services.macro_tracker_service.get_tracker_by_id', return_value=None)
    with pytest.raises(LookupError):
        patch_entry(1, 1, {'food_name': 'X'})


def test_remove_entry_not_found(mocker):
    mocker.patch('app.services.macro_tracker_service.get_tracker_by_id', return_value=None)
    with pytest.raises(LookupError):
        remove_entry(1, 1)
