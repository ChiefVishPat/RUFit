import AsyncStorage from '@react-native-async-storage/async-storage';
import { APIClient } from '../../api/APIClient';
import * as status_constants from '../../../constants/StatusConstants';
async function setAccessToken(a){ AsyncStorage.setItem('access_token', a); }
async function setRefreshToken(r){ AsyncStorage.setItem('refresh_token', r); }

// This file provides functions for user authentication, communicating with backend

const user_registration = async ({ username, password, email }) => {
    // Required fields
    if (!username || !password) {
        return status_constants.EMPTY_FIELDS_ERROR
    }

    // Log all input (optional)
    try {
        const register_response = await APIClient.post('/auth/register', {
            username:username,
            password:password,
            email:email
        });
        return status_constants.API_REQUEST_SUCCESS;
    } catch (error) {
        (error.response.data.message);
        return error.response.data.message;
    }
};

// sets user profile preferences
const set_user_pref = async ({user_data}) => {
    // (user_data);
    try{
        ("setting user pref...");
        const response = await APIClient.post('/userinfo', {user_data}, {sendAccess:true});
        return status_constants.API_REQUEST_SUCCESS;
    }
    catch(error){
        ("error occured during set_user_pref");
        if (error.response.data.message){
            return error.response.data.message;
        }
        if (error.response.data.msg){
            return error.response.data.msg;
        }
        return error.response.statusText || "Unknown error occurred";
    }
}

const user_login = async ({username, password}) => {
    
    ("userauthactions login... ");
    if (!username || !password) {
        return status_constants.EMPTY_FIELDS_ERROR
    }

    try {
        const response = await APIClient.post('/auth/login', { username, password });
        (response.data?.access_token);
        (response.data?.refresh_token);
        await setAccessToken(response.data?.access_token);
        await setRefreshToken(response.data?.refresh_token);
        return status_constants.API_REQUEST_SUCCESS;
    } catch (error) {
        // console.error(`user_login error: ${error}`);
        return error;
    }
}

const user_logout = async () => {
    // add line to send request to Flask for logout (handle removal of tokens, etc.)
    try {
        await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        return status_constants.API_REQUEST_SUCCESS;
    }
    catch(error){
        console.error(error);
    }
}
export { user_registration, user_login, set_user_pref, user_logout };

// const AuthenticationWrapper = ({ children }) => {