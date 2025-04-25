import { API_REQUEST_SUCCESS } from "../../constants/StatusConstants";
import { APIClient } from "../api/APIClient"

/*
    This file will contain functions that perform API requests
    to retrieve any kind of user profile info
 */

const get_user_profile = async() => {
    try {
        console.log("get_user_profile starting...");
        const response = await APIClient.get("/userinfo", {sendAccess:true});
        console.log(`UserProfileRequests: ${response.data}`);
        return response.data;
    }
    catch(error){
        return error;
    }
    
    
}

export { get_user_profile }