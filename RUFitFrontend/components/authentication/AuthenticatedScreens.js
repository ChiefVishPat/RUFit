import React from 'react';
import AuthenticationWrapper from './AuthenticationWrapper';
import ClientHomeScreen from '../../app/postauth/client/ClientHomeScreen';

// Example: Wrap HomeScreen with ProtectedScreen
const AuthenticatedClientHomeScreen = () => (
    <AuthenticationWrapper>
        <ClientHomeScreen/>
    </AuthenticationWrapper>
);

// We can write as many exports as we need for protected screens

export { AuthenticatedClientHomeScreen };