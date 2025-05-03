/*

{ "chooseRole" component }

if (client){
    { "enterBodyData" component } --> age, height, weight
    { "intensityLevel" component } --> choose training intensity level
    { "setGoals" component } --> what is your fitness goal?
        - gain weight and muscle
        - lose weight and maintain muscle
        - maintain current weight
            --> weight goals will correlate to the kind of calorie tracker we provide (surplus, deficit, maintain, etc.)
        - train more consistently (we can later have a feature where we
                                   remind the client to go to the gym if
                                   they haven't gone in a couple of days)
    
    navigation.navigate(AuthenticatedClientHomeScreen)      
}

else (coach){

}

*/

import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import BodyDataScreen from './BodyDataScreen'
import IntensityLevelScreen from './IntensityLevelScreen'
import SetGoalsScreen from './SetGoalsScreen'
import ChooseRoleScreen from './ChooseRoleScreen'

import { global_styles } from '../../GlobalStyles';
import { useRoute } from '@react-navigation/native';


const UserProfileSetup = () => {
    const Stack = createStackNavigator();
    const route = useRoute();
    const { username, password, email } = route.params
    // const { email, username, password } = route.params;
    return (
        <Stack.Navigator initialRouteName="BodyData">
            <Stack.Screen
                name="BodyData"
                component={BodyDataScreen}
                initialParams={{ username, password, email  }}
                options={{ headerShown: false,
                           gestureEnabled: false}}
            />
            <Stack.Screen
                name="IntensityLevel"
                component={IntensityLevelScreen}
                options={{ headerShown: false,
                           gestureEnabled: false }}
            />
            <Stack.Screen
                name="SetGoals"
                component={SetGoalsScreen}
                options={{ headerShown: false,
                           gestureEnabled: false }}
            />
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '60%',
        marginBottom: 20,
    },
});

export default UserProfileSetup;