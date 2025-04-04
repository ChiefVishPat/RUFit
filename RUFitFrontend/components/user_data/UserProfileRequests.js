import { APIClient } from "../api/APIClient"

/*
    This file will contain functions that perform API requests
    to retrieve any kind of user profile info
 */

const get_user_profile = async() => {
    try {
        const response = APIClient.get("/userinfo", {sendAccess:true});
    }
    catch(error){
        throw error;
    }
    
    
}

export { get_user_profile }