import { View, Text, StyleSheet, ActivityIndicator, Dimensions, KeyboardAvoidingView, Platform } from "react-native";
import { ScaledSheet } from 'react-native-size-matters';
import { useState } from "react";
import { GradientScreen } from "../../GlobalStyles";
import ScarletPressable from '../../../components/ui/buttons/ScarletPressable';
import BasicPressable from '../../../components/ui/buttons/BasicPressable';
import VerticalToggleChoice from "../../../components/ui/buttons/VerticalToggleChoice";
import { setGoalsPrompts, getValueByLabel } from "../../../components/ui/text_prompts/text_prompts";
import ModalAlert from '../../../components/ui/alerts/ModalAlert';
import * as status_constants from '../../../constants/StatusConstants';

import {
    useFonts,
} from '@expo-google-fonts/big-shoulders-display';
import { Kanit_400Regular } from '@expo-google-fonts/kanit';
import { user_login, set_user_pref } from "../../../components/authentication/user_auth/UserAuthActions";
import { useUser } from "../../../components/user_data/UserContext";

// SetGoalsScreen allows user to choose a dietary goal and finalizes onboarding
const SetGoalsScreen = ({ navigation, route }) => {
    const { refreshUser } = useUser();

    // Load fonts
    const [fontsLoaded] = useFonts({
        Kanit_400Regular,
    });

    const [isAlertVisible, setIsAlertVisible] = useState(false);
    const [registrationError, setRegistrationError] = useState(false);
    const { username, password, ...filteredUserData } = route.params;
    const [chosenGoal, setChosenGoal] = useState('DEFICIT');

    // Updates selected goal
    const handleGoalChange = (goal) => {
        setChosenGoal(goal.toUpperCase());
    };

    // Handles final submit: login -> set prefs -> refresh -> navigate
    const handlePress = async () => {
        const user_data = {
            ...filteredUserData,
            goal: chosenGoal
        };
        (`user_data in set goals screen: ${user_data}`);
        ("🧠 user_data:", JSON.stringify(user_data, null, 2));

        try {
            const loginResult = await user_login({ username, password });

            if (loginResult === status_constants.API_REQUEST_SUCCESS) {
                ("✅ User login successful");

                const prefResult = await set_user_pref({ user_data });
                if (prefResult === status_constants.API_REQUEST_SUCCESS) {
                    ("✅ User preferences saved to DB");

                    await refreshUser();
                    navigation.reset({
                        index: 0,
                        routes: [{ name: "ClientIndex" }]
                    });
                } else {
                    console.error("❌ Failed to save user preferences:", prefResult);
                    return;
                }
            } else {
                console.error("❌ Login failed:", loginResult);
                return;
            }
        } catch (error) {
            setIsAlertVisible(true);

            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Something went wrong. Please try again.";

            setRegistrationError(errorMessage);
            ("SetGoals Error:", error);
        }
    };

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
                    <BasicPressable disabled={false} btnText="Back" onPress={() => { navigation.goBack() }} />
                </View>
                <View style={styles.nextBtnContainer}>
                    <ScarletPressable btnText="Finish" onPress={handlePress} />
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
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    screenTitleContainer: {
        width: Dimensions.get('screen').width * 0.9,
        height: 'fit-content',
        padding: 10,
        marginTop: 100,
        borderColor: 'blue',
    },
    subTextContainer: {
        width: Dimensions.get('screen').width * 0.9,
        height: 'fit-content',
        paddingHorizontal: 10,
        borderColor: 'blue',
    },
    forms: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignSelf: 'center',
        width: Dimensions.get('screen').width * 0.9,
        margin: -20,
        marginTop: 10,
        borderColor: 'blue',
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
        fontSize: '35@s',
        fontFamily: 'Kanit_400Regular',
        color: 'white',
        alignSelf: 'flex-start',
    },
    subText: {
        alignSelf: 'flex-start',
        marginTop: 20,
        fontSize: '25@ms',
        fontFamily: 'Kanit_400Regular',
        color: 'white',
    },
});

export default SetGoalsScreen;
