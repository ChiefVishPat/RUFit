import AsyncStorage from '@react-native-async-storage/async-storage';
import { APIClient } from '../../api/APIClient';
import * as status_constants from '../../../constants/StatusConstants';
function setAccessToken(a){ AsyncStorage.setItem('accessToken', a); }
function setRefreshToken(r){ AsyncStorage.setItem('accessToken', a); }

const user_registration = async ({email, username, password}) => {
    
    try {
        const response = await APIClient.post('/register', { email, username, password });
        console.log(response.data.message); // This runs only if the Promise resolves
        return status_constants.API_REQUEST_SUCCESS;
    } catch (error) {
        if (error.response){
            return error.response.data.message;
        }
    }
}

const user_login = async ({username, password}) => {

    try {
        const response = await APIClient.post('/login', { username, password });
        setAccessToken(response.data['access_token']);
        return status_constants.API_REQUEST_SUCCESS;
    } catch (error) {
        if (error.response){
            return error.response.data.message;
        }
        
    }
}
export { user_registration, user_login };

// const AuthenticationWrapper = ({ children }) => {