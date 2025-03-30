import AsyncStorage from '@react-native-async-storage/async-storage';
import { APIClient } from '../../api/APIClient';
import * as status_constants from '../../../constants/StatusConstants';
function setAccessToken(a){ AsyncStorage.setItem('access_token', a); }
function setRefreshToken(r){ AsyncStorage.setItem('refresh_token', r); }

// registers user with [ email, username, password ] 
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
        return error.response.data.message;
    }
};

// sets user profile preferences
const set_user_pref = async ({user_data}) => {
    // console.log(user_data);
    try{
        const response = await APIClient.post('/userinfo', {user_data}, {sendAccess:true});
        return status_constants.API_REQUEST_SUCCESS;
    }
    catch(error){
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
    
    if (!username || !password) {
        return status_constants.EMPTY_FIELDS_ERROR
    }

    try {
        const response = await APIClient.post('/auth/login', { username, password });
        setAccessToken(response.data['access_token']);
        setRefreshToken(response.data['refresh_token']);
        return status_constants.API_REQUEST_SUCCESS;
    } catch (error) {
        return error.response.data.message;
    }
}
export { user_registration, user_login, set_user_pref };

// const AuthenticationWrapper = ({ children }) => {