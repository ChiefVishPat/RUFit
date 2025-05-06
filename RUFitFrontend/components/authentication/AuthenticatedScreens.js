import React from 'react';
import AuthenticationWrapper from './AuthenticationWrapper';
import ClientHomeScreen from '../../app/postauth/client/ClientHomeScreen';
import WorkoutNavigator from '../../app/postauth/client/workouts/WorkoutNavigator';
import ClientProfileScreen from '../../app/postauth/client/profile/ClientProfileScreen';
import ExerciseNavigator from '../../app/postauth/client/exercises/ExerciseNavigator';
import BarcodeScanner from '../../app/postauth/client/macrotrackerBC/ScanMacroScreen';
import MacroTrackerNavigator from '../../app/postauth/client/macrotrackerBC/MacroTrackerNavigator';


// Exports protected screens with AuthenticationWrapper
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

export const AuthenticatedExerciseNavigator = () => (
    <AuthenticationWrapper>
        <ExerciseNavigator />
    </AuthenticationWrapper>
);

export const AuthenticatedClientProfileScreen = () => (
    <AuthenticationWrapper>
        <ClientProfileScreen />
    </AuthenticationWrapper>
);

export const AuthenticatedMacroTrackerNavigator = () => (
    <AuthenticationWrapper>
        <MacroTrackerNavigator />
    </AuthenticationWrapper>
);