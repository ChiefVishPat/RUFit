import pytest
from app.services.userinfo_service import (
    add_or_update_userinfo,
    fetch_userinfo,
)


@pytest.fixture
def sample_data():
    return {
        'gender': 'Male',
        'weight': 180,
        'weightUnit': 'lb',
        'heightValue1': 5,
        'heightValue2': 10,
        'heightUnit': 'US',
        'trainingIntensity': 'Intermediate',
        'goal': 'Maintain',
    }


def test_add_or_update_userinfo_calls_dao(mocker, sample_data):
    mock_dao = mocker.patch(
        'app.dao.userinfo_dao.add_or_update_userinfo_dao',
        return_value='DAO_OK',
    )
    result = add_or_update_userinfo('user42', sample_data)
    assert result == 'DAO_OK'
    mock_dao.assert_called_once_with('user42', sample_data)


def test_add_or_update_userinfo_propagates_exceptions(mocker, sample_data):
    err = RuntimeError('DB error')
    mock_dao = mocker.patch(
        'app.dao.userinfo_dao.add_or_update_userinfo_dao',
        side_effect=err,
    )
    with pytest.raises(RuntimeError) as excinfo:
        add_or_update_userinfo('user42', sample_data)
    assert excinfo.value is err


def test_fetch_userinfo_calls_dao(mocker):
    expected = {'age': 30, 'weight': 180}
    mock_dao = mocker.patch(
        'app.dao.userinfo_dao.get_userinfo_by_user',
        return_value=expected,
    )
    result = fetch_userinfo('user42')
    assert result == expected
    mock_dao.assert_called_once_with('user42')


def test_fetch_userinfo_propagates_exceptions(mocker):
    err = KeyError('Not found')
    mock_dao = mocker.patch(
        'app.dao.userinfo_dao.get_userinfo_by_user',
        side_effect=err,
    )
    with pytest.raises(KeyError):
        fetch_userinfo('user42')
