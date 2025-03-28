import AsyncStorage from '@react-native-async-storage/async-storage';
import { APIClient } from '../../api/APIClient';
import * as status_constants from '../../../constants/StatusConstants';
function setAccessToken(a){ AsyncStorage.setItem('accessToken', a); }
function setRefreshToken(r){ AsyncStorage.setItem('refreshToken', r); }

// registers user with [ email, username, password ] 
const user_registration = async ({ username, password, email }) => {
    // Required fields
    if (!username || !password) {
        return status_constants.EMPTY_FIELDS_ERROR
    }

    // Log all input (optional)
    console.log("Username:", username);
    console.log("Password:", password);
    console.log("Email:", email);
    try {
        console.log('user registration began');
        const register_response = await APIClient.post('/auth/register', {
            username:username,
            password:password,
            email:email
        });
        return status_constants.API_REQUEST_SUCCESS;
    } catch (error) {
        console.log('issue');
        return error.response.data.message;
    }
};

// sets user profile preferences
const set_user_pref = async ({}) => {}

const user_login = async ({username, password}) => {
    try {
        const response = await APIClient.post('/auth/login', { username, password });
        setAccessToken(response.data['access_token']);
        setRefreshToken(response.data['refresh_token']);
        return status_constants.API_REQUEST_SUCCESS;
    } catch (error) {
        return error.response.status;
    }
}
export { user_registration, user_login };

// const AuthenticationWrapper = ({ children }) => {