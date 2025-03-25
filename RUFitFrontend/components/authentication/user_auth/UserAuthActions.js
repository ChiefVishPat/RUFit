import AsyncStorage from '@react-native-async-storage/async-storage';
import { APIClient } from '../../api/APIClient';
import * as status_constants from '../../../constants/StatusConstants';
function setAccessToken(a){ AsyncStorage.setItem('accessToken', a); }
function setRefreshToken(r){ AsyncStorage.setItem('accessToken', a); }

const user_registration = async ({ username, password, ...extraFields }) => {
    // Required fields
    if (!username || !password) {
        throw new Error("Username and password are required!");
    }

    // Log all input (optional)
    console.log("Username:", username);
    console.log("Password:", password);
    console.log("Additional fields:", extraFields); // Everything else

    try {
        const register_response = await APIClient.post('/register', {
            username,
            password,
        });
        const userpref_response = await APIClient.post('/userinfo', {
            ...extraFields
        })

        return status_constants.API_REQUEST_SUCCESS;
    } catch (error) {
        return error.response?.status || 500;
    }
};

const user_login = async ({username, password}) => {

    try {
        const response = await APIClient.post('/login', { username, password });
        setAccessToken(response.data['access_token']);
        return status_constants.API_REQUEST_SUCCESS;
    } catch (error) {
        return error.response.status;
    }
}
export { user_registration, user_login };

// const AuthenticationWrapper = ({ children }) => {