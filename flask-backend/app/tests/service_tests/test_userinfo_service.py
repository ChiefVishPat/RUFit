import pytest
from app.services.userinfo_service import add_or_update_userinfo, fetch_userinfo


@pytest.fixture
def sample_data():
    """
    Provides a representative payload of userinfo fields
    for testing both creation and update paths.
    """
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
    """
    Verifies that when no existing record is found,
    add_or_update_userinfo calls get_userinfo_by_user()
    then create_userinfo(), and returns ('DAO_OK', 'created').
    """
    # Simulate "no existing userinfo" branch
    mock_get = mocker.patch('app.services.userinfo_service.get_userinfo_by_user', return_value=None)
    # Stub out DAO create to return a sentinel
    mock_create = mocker.patch('app.services.userinfo_service.create_userinfo', return_value='DAO_OK')

    # Call service under test
    result, status = add_or_update_userinfo('user42', sample_data)

    # Should return the stubbed DAO result and "created" flag
    assert result == 'DAO_OK'
    assert status == 'created'
    # Ensure we first looked up and then created
    mock_get.assert_called_once_with('user42')
    mock_create.assert_called_once_with('user42', sample_data)


def test_add_or_update_userinfo_propagates_exceptions(mocker, sample_data):
    """
    If create_userinfo() raises, the service should not swallow it
    but instead propagate the original exception.
    """
    # Still simulate "no existing userinfo" path
    mocker.patch('app.services.userinfo_service.get_userinfo_by_user', return_value=None)
    # Make create_userinfo raise
    err = RuntimeError('DB error')
    mocker.patch('app.services.userinfo_service.create_userinfo', side_effect=err)

    # Expect that calling the service bubbles up the same error
    with pytest.raises(RuntimeError) as excinfo:
        add_or_update_userinfo('user42', sample_data)
    assert excinfo.value is err


def test_fetch_userinfo_calls_dao(mocker):
    """
    Verifies that fetch_userinfo() simply delegates to
    get_userinfo_by_user() and returns its value.
    """
    expected = {'age': 30, 'weight': 180}
    mock_get = mocker.patch('app.services.userinfo_service.get_userinfo_by_user', return_value=expected)

    result = fetch_userinfo('user42')

    # Returned value matches DAO stub
    assert result == expected
    # Confirm the correct DAO function was invoked with the user ID
    mock_get.assert_called_once_with('user42')


def test_fetch_userinfo_propagates_exceptions(mocker):
    """
    If get_userinfo_by_user() raises, fetch_userinfo()
    should propagate that exception unchanged.
    """
    err = KeyError('Not found')
    mocker.patch('app.services.userinfo_service.get_userinfo_by_user', side_effect=err)

    # The service call must raise the same KeyError
    with pytest.raises(KeyError) as excinfo:
        fetch_userinfo('user42')
    assert excinfo.value is err
