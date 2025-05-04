import pytest
from app.extensions import db
from app.models.macro_tracker import Tracker


@pytest.mark.usefixtures('db')
class TestMacroTrackerRoutes:
    @pytest.fixture(autouse=True)
    def auth_header(self, client):
        # register & login a test user
        client.post('/auth/register', json={'username': 'joe', 'password': 'pw', 'email': 'joe@example.com'})
        login = client.post('/auth/login', json={'username': 'joe', 'password': 'pw'}).get_json()
        token = login['access_token']
        return {'Authorization': f'Bearer {token}'}

    def test_get_empty_list(self, client, auth_header):
        resp = client.get('/tracker', headers=auth_header)
        assert resp.status_code == 200
        assert resp.get_json() == []

    def test_create_missing_food_name(self, client, auth_header):
        # payload without food_name must 400
        resp = client.post('/tracker', json={}, headers=auth_header)
        assert resp.status_code == 400
        assert resp.get_json()['message'] == 'Food name is required'

    def test_create_and_get_entry(self, client, auth_header):
        payload = {
            'food_name': 'Banana',
            'calories': 100,
            'protein': 1,
            'carbs': 25,
            'fiber': 3,
            'sat_fat': 0,
            'unsat_fat': 0,
        }
        # create
        create_resp = client.post('/tracker', json=payload, headers=auth_header)
        assert create_resp.status_code == 200
        assert create_resp.get_json()['message'] == 'Macros updated successfully'

        # GET returns one record
        get_resp = client.get('/tracker', headers=auth_header)
        assert get_resp.status_code == 200
        data = get_resp.get_json()
        assert isinstance(data, list) and len(data) == 1
        rec = data[0]
        assert rec['food_name'] == 'Banana'
        assert rec['calories'] == 100

    def test_update_not_found(self, client, auth_header):
        # 999 likely doesn't exist
        resp = client.patch('/tracker/999', json={'calories': 50}, headers=auth_header)
        assert resp.status_code == 404
        assert resp.get_json()['message'] == 'Tracker entry not found'

    def test_update_entry(self, client, auth_header):
        # first create
        payload = {
            'food_name': 'Apple',
            'calories': 50,
            'protein': 1,
            'carbs': 10,
            'fiber': 2,
            'sat_fat': 0,
            'unsat_fat': 0,
        }
        client.post('/tracker', json=payload, headers=auth_header)
        rec = Tracker.query.filter_by(food_name='Apple').first()
        assert rec is not None

        # patch it
        patch_resp = client.patch(f'/tracker/{rec.id}', json={'calories': 75}, headers=auth_header)
        assert patch_resp.status_code == 200
        assert patch_resp.get_json()['message'] == 'Tracker entry updated successfully'

        # confirm in DB
        updated = db.session.get(Tracker, rec.id)
        assert updated.calories == 125  # original 50 + 75

    def test_delete_not_found(self, client, auth_header):
        resp = client.delete('/tracker/12345', headers=auth_header)
        assert resp.status_code == 404
        assert resp.get_json()['message'] == 'Tracker entry not found'

    def test_delete_entry(self, client, auth_header):
        # create then delete
        client.post(
            '/tracker',
            json={
                'food_name': 'Orange',
                'calories': 80,
                'protein': 1,
                'carbs': 18,
                'fiber': 3,
                'sat_fat': 0,
                'unsat_fat': 0,
            },
            headers=auth_header,
        )
        rec = Tracker.query.filter_by(food_name='Orange').first()
        assert rec is not None

        del_resp = client.delete(f'/tracker/{rec.id}', headers=auth_header)
        assert del_resp.status_code == 200
        assert del_resp.get_json()['message'] == 'Tracker entry deleted successfully'

        # confirm gone
        assert db.session.get(Tracker, rec.id) is None
