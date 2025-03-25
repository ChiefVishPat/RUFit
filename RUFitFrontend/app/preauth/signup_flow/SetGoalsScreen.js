import { View, Text, StyleSheet, ActivityIndicator, Dimensions, KeyboardAvoidingView, Platform } from "react-native"
import { ScaledSheet, } from 'react-native-size-matters';
import { useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { global_styles, GradientScreen } from "../../GlobalStyles";
import ScarletPressable from '../../../components/ui/buttons/ScarletPressable';
import BasicPressable from '../../../components/ui/buttons/BasicPressable';
import TrainingIntensityToggleBtn from "../../../components/ui/buttons/TrainingIntensityToggleBtn";
import { setGoalsPrompts, getValueByLabel } from "../../../components/ui/text_prompts/text_prompts";

import {
    useFonts,
    BigShouldersDisplay_700Bold,
} from '@expo-google-fonts/big-shoulders-display';
import { Kanit_400Regular } from '@expo-google-fonts/kanit';
import { user_registration } from "../../../components/authentication/user_auth/UserAuthActions";

const SetGoalsScreen = ({ navigation, route }) => {

    const [fontsLoaded] = useFonts({
        BigShouldersDisplay_700Bold,
        Kanit_400Regular,
    });

    const [chosenGoal, setChosenGoal] = useState(null);

    const handleGoalChange = (goal) => {
        setChosenGoal(goal);
    };

    const setAuthStatus = async () => {
        try {
          await AsyncStorage.setItem('authenticated', JSON.stringify(true));
          console.log('Authentication status saved successfully!');
        } catch (error) {
          console.error('Failed to save authentication status:', error);
        }
    };

    const handlePress = async () => {

        setAuthStatus() 
        const user_data = {
            ...route.params,
            goal: chosenGoal
        };
        
        console.log(user_data);
        const result = await user_registration(user_data);
        navigation.navigate('AuthenticatedClientHomeScreen', );
    }
    
    if (!fontsLoaded) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <GradientScreen>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingContainer}
            >
                <View style={styles.container}>
                    <View style={styles.screenTitleContainer}>
                        <Text style={fontStyles.screenTitleText}>Your Goals</Text>
                    </View>
                    <View style={styles.subTextContainer}>
                        <Text style={fontStyles.subText}>What is your diet goal? You may opt out of answering this if you'd like</Text>
                    </View>
                    <View style={styles.forms}>
                        <TrainingIntensityToggleBtn
                            onValueChange={handleGoalChange}
                            Label1="Deficit"                                
                            Label2="Maintain"                                
                            Label3="Surplus">                                
                        </TrainingIntensityToggleBtn>
                    </View>

                    <View style={styles.subTextContainer}>
                        <Text style={fontStyles.subText}>({getValueByLabel(setGoalsPrompts, chosenGoal)})</Text>
                    </View>
                    
                </View>
            </KeyboardAvoidingView>
            
            <View style={styles.navigationBtnContainer}>
                
                <View style={styles.backBtnContainer}>
                    <BasicPressable disabled={false} btnText="Back" onPress={() => {navigation.goBack()}}></BasicPressable>
                </View>
                
                <View style={styles.nextBtnContainer}>
                    <ScarletPressable btnText="Next" onPress={() => handlePress()}>
                    </ScarletPressable>
                </View>

            </View>
        </GradientScreen>
    );
};

const styles = StyleSheet.create({
    keyboardAvoidingContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    container: {
        //flex: 1,
        //flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        //margin: 40,
        backgroundColor: 'transparent',
        //borderColor: 'pink',
        //borderWidth: 2,
    },
    screenTitleContainer: {
        width: Dimensions.get('screen').width * 0.9,
        height: 'fit-content',
        padding: 10,
        marginTop: 100,
        borderColor: 'blue',
        //borderWidth: 2,
    },
    subTextContainer: {
        width: Dimensions.get('screen').width * 0.9,
        height: 'fit-content',
        paddingHorizontal: 10,
        borderColor: 'blue',
        //borderWidth: 2,
    },
    forms: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignSelf: 'center',
        width: Dimensions.get('screen').width * 0.9,
        margin: -20,
        marginTop: 10,
        borderColor: 'blue',
        //borderWidth: 2,
    },
    navigationBtnContainer: {
        flexDirection: 'row',
        width: Dimensions.get('window').width * 0.85,
        height: 'fit-content',
        margin: 20,
        alignItems: 'center',
        justifyContent: 'stretch',
    },
    backBtnContainer: {
        flex: 1,
        width: '50%',
        height: 'fit-content',
        marginRight: 10,
    },
    nextBtnContainer: {
        flex: 1,
        width: '50%',
        height: 'fit-content',
        marginLeft: 10,
    },
});

const fontStyles = ScaledSheet.create({
    screenTitleText: {
        //transform: [{ translateY: Dimensions.get('screen').height * -0.32 }],
        fontSize: '35@s',
        fontFamily: 'Kanit_400Regular',
        color: 'white',
        alignSelf: 'flex-start',
    },
    subText: {
        //transform: [{ translateY: Dimensions.get('screen').height * -0.3 }],
        alignSelf: 'flex-start',
        marginTop: 20,
        fontSize: '25@ms',
        fontFamily: 'Kanit_400Regular',
        color: 'white',
    },
});

export default SetGoalsScreen;