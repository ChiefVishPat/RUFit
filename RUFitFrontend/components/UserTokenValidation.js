export function validate(accessToken, refreshToken){
    if (accessToken && refreshToken){return true;}
    return false;
}

// "validate()" will check if the given access token has not expired yet
// If it has, it will use refreshToken to create updated access token
// If refreshToken does not exist or has expired, return false

function isExpired(token){}