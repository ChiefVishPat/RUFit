import React from 'react';
import AuthenticationWrapper from './AuthenticationWrapper';
import ClientHomeScreen from '../../app/postauth/client/ClientHomeScreen';
import SavedWorkoutsScreen from '../../app/postauth/client/SavedWorkoutsScreen';
import SaveWorkoutScreen from '../../app/postauth/client/SaveWorkoutScreen';

// Example: Wrap HomeScreen with ProtectedScreen
const AuthenticatedClientHomeScreen = () => (
    <AuthenticationWrapper>
        <ClientHomeScreen/>
    </AuthenticationWrapper>
);
const AuthenticatedSavedWorkoutsScreen = () => (
    <AuthenticationWrapper>
        <SavedWorkoutsScreen />
    </AuthenticationWrapper>
);
const AuthenticatedSaveWorkoutScreen = () => (
    <AuthenticationWrapper>
        <SaveWorkoutScreen />
    </AuthenticationWrapper>
);

// We can write as many exports as we need for protected screens

export { AuthenticatedClientHomeScreen, AuthenticatedSavedWorkoutsScreen, AuthenticatedSaveWorkoutScreen};