import React from 'react';
import AuthenticationWrapper from './AuthenticationWrapper';
import ClientHomeScreen from '../../app/postauth/client/ClientHomeScreen';
//import SavedWorkoutsScreen from '../../app/postauth/client/workouts/SavedWorkoutsScreen';
//import { SavedWorkoutsNavigator } from '../../app/postauth/client/workouts/SavedWorkoutsScreen';
//import SaveWorkoutScreen from '../../app/postauth/client/workouts/SaveWorkoutScreen';
import WorkoutNavigator from '../../app/postauth/client/workouts/WorkoutNavigator';
// import WorkoutDetailScreen from '../../app/postauth/client/WorkoutDetailScreen';
import ClientProfileScreen from '../../app/postauth/client/profile/ClientProfileScreen';
import MyBodyData from '../../app/postauth/client/profile/MyBodyData';
import AccountSettings from '../../app/postauth/client/profile/AccountSettings';
import ProfileSettings from '../../app/postauth/client/profile/ProfileSettings';

// Example: Wrap HomeScreen with ProtectedScreen
export const AuthenticatedClientHomeScreen = () => (
    <AuthenticationWrapper>
        <ClientHomeScreen/>
    </AuthenticationWrapper>
);
export const AuthenticatedWorkoutNavigator = () => (
    <AuthenticationWrapper>
        <WorkoutNavigator/>
    </AuthenticationWrapper>
);

{/* 

    export const AuthenticatedSavedWorkoutsScreen = () => (
    <AuthenticationWrapper>
        <SavedWorkoutsScreen />
    </AuthenticationWrapper>
    
    export const AuthenticatedSaveWorkoutScreen = () => (
    <AuthenticationWrapper>
        <SaveWorkoutScreen />
    </AuthenticationWrapper>
);
);
*/}

{/*
    export const AuthenticatedWorkoutDetailScreen = () => (
    <AuthenticationWrapper>
        <WorkoutDetailScreen />
    </AuthenticationWrapper>
);
 */} 


export const AuthenticatedClientProfileScreen = () => (
    <AuthenticationWrapper>
        <ClientProfileScreen />
    </AuthenticationWrapper>
);

export const AuthenticatedMyBodyDataScreen = () => (
    <AuthenticationWrapper>
        <MyBodyData />
    </AuthenticationWrapper>
);

export const AuthenticatedAccountSettingsScreen = () => (
    <AuthenticationWrapper>
        <AccountSettings />
    </AuthenticationWrapper>
);

export const AuthenticatedProfileSettingsScreen = () => (
    <AuthenticationWrapper>
        <ProfileSettings />
    </AuthenticationWrapper>
);