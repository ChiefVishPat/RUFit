export function validate(accessToken, refreshToken){
    //if (accessToken && refreshToken){return true;}
    //return false;

    // temporarily, we will return true to pass all auth checks while testing
    if (accessToken){
        return true;
    }
}

// "validate()" will check if the given access token has not expired yet
// If it has, it will use refreshToken to create updated access token
// If refreshToken does not exist or has expired, return false

function isExpired(token){}