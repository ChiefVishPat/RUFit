import { View, Text, StyleSheet, ActivityIndicator, Dimensions, KeyboardAvoidingView, Platform } from "react-native"
import { ScaledSheet, } from 'react-native-size-matters';
import { useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { global_styles, GradientScreen } from "../../GlobalStyles";
import ScarletPressable from '../../../components/ui/buttons/ScarletPressable';
import BasicPressable from '../../../components/ui/buttons/BasicPressable';
import VerticalToggleChoice from "../../../components/ui/buttons/VerticalToggleChoice";
import { setGoalsPrompts, getValueByLabel } from "../../../components/ui/text_prompts/text_prompts";
import ModalAlert from '../../../components/ui/alerts/ModalAlert'
import * as status_constants from '../../../constants/StatusConstants';

import {
    useFonts,
    BigShouldersDisplay_700Bold,
} from '@expo-google-fonts/big-shoulders-display';
import { Kanit_400Regular } from '@expo-google-fonts/kanit';
import { user_login, set_user_pref} from "../../../components/authentication/user_auth/UserAuthActions";

const SetGoalsScreen = ({ navigation, route }) => {

    const [fontsLoaded] = useFonts({
        BigShouldersDisplay_700Bold,
        Kanit_400Regular,
    });

    const [ isAlertVisible, setIsAlertVisible ] = useState(false);
    const [ registrationError, setRegistrationError ] = useState(false);

    const { username, password, ...filteredUserData } = route.params;

    const [chosenGoal, setChosenGoal] = useState('Deficit');

    const handleGoalChange = (goal) => {
        setChosenGoal(goal);
    };

    const handlePress = async () => {
        const user_data = {
            ...filteredUserData,
            goal: chosenGoal
        };
        
        try {
            const loginResult = await user_login({username:username, password:password});
            // if no errors, access and refresh tokens should be set
            const result = await set_user_pref({user_data});
            if (result == status_constants.API_REQUEST_SUCCESS){
                console.log("user info saved to DB succesfully");
            }
            if (loginResult == status_constants.API_REQUEST_SUCCESS){
                navigation.navigate("ClientIndex");
                // ^^
                // probably have to send some data, but most likely not
                // should be able to access info when needed from backend using access_token
            }
        }
        catch(error){
            setIsAlertVisible(true);
            setRegistrationError(error);
            console.log(error);
        }
        
        
        // ^ needs to be sent to a frontend func that handles userpref set

        // before navigating, log in User. user login should handle access and refresh token setting
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

            <ModalAlert
                isVisible={isAlertVisible}
                title="Issue registering"
                message={registrationError}
                onClose={() => setIsAlertVisible(false)}
            />

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
                        <VerticalToggleChoice
                            onValueChange={handleGoalChange}
                            labels={['Deficit', 'Maintain', 'Surplus']}
                            selectedIndex={1}>                             
                        </VerticalToggleChoice>
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
                    <ScarletPressable btnText="Finish" onPress={() => handlePress()}>
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