import React from 'react';
import AuthenticationWrapper from './AuthenticationWrapper';
import HomeScreen from '../../app/postauth/HomeScreen';

// Example: Wrap HomeScreen with ProtectedScreen
const AuthenticatedHomeScreen = () => (
    <AuthenticationWrapper>
        <HomeScreen />
    </AuthenticationWrapper>
);

// We can write as many exports as we need for protected screens

export { AuthenticatedHomeScreen };