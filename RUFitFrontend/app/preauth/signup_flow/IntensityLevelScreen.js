import { View, Text, StyleSheet, ActivityIndicator, Dimensions, TextInput, Keyboard, KeyboardAvoidingView, Platform } from "react-native"
import { ScaledSheet, moderateScale, scale, verticalScale } from 'react-native-size-matters';
import DropDownPicker from "react-native-dropdown-picker";
import ToggleButton from "../../../components/ui/ToggleButton";
import { useState, useEffect } from "react";
import { global_styles, GradientScreen } from "../../GlobalStyles";
import ScarletPressable from '../../../components/ui/buttons/ScarletPressable';
import BasicPressable from '../../../components/ui/buttons/BasicPressable';
import TrainingIntensityToggleBtn from "../../../components/ui/buttons/TrainingIntensityToggleBtn";

import {
    useFonts,
    BigShouldersDisplay_700Bold,
} from '@expo-google-fonts/big-shoulders-display';
import { Kanit_400Regular } from '@expo-google-fonts/kanit';

/*

onPress={ () => {
                        navigation.navigate('UserProfileSetup', {
                            email: email,
                            username: username,
                            password: password
                        })
                    } }

 */

const IntensityLevelScreen = ({ navigation, route }) => {
    const [fontsLoaded] = useFonts({
        BigShouldersDisplay_700Bold,
        Kanit_400Regular,
    });

    const [chosenIntensity, setChosenIntensity] = useState(null);

    const handleIntensityChange = (intensityLevel) => {
        setChosenIntensity(intensityLevel);
        // console.log("Active Intensity Level:", intensityLevel);  // Debugging log
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
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingContainer}
            >
                <View style={styles.container}>
                    <View style={styles.screenTitleContainer}>
                        <Text style={fontStyles.screenTitleText}>Training Intensity</Text>
                    </View>
                    <View style={styles.subTextContainer}>
                    <Text style={fontStyles.subText}>We've designed this to work for everyone - from first-time to professional lifters </Text>
                    <Text style={fontStyles.subText}>How intensely do you want to train?</Text>
                    </View>

                    <View style={styles.forms}>
                        <TrainingIntensityToggleBtn
                            onIntensityChange={handleIntensityChange}>                                
                        </TrainingIntensityToggleBtn>
                    </View>
                </View>
            </KeyboardAvoidingView>
            
            <View style={styles.navigationBtnContainer}>
                
                <View style={styles.backBtnContainer}>
                    <BasicPressable disabled={false} btnText="Back" onPress={() => {navigation.goBack()}}></BasicPressable>
                </View>
                
                <View style={styles.nextBtnContainer}>
                    <ScarletPressable btnText="Next" onPress={() => {
                        navigation.navigate('SetGoals', {
                            ...route.params,
                            trainingIntensity: chosenIntensity
                        });
                        console.log(route.params);
                    }}>
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
    topTextContainer: {
        flex: 0.8,
        //flexDirection: 'column',
        width: Dimensions.get('screen').width * 0.9,
        height: 'fit-content',
        margin: 40,
        marginTop: 40,
        marginBottom: 0,
        padding: 10,
        borderColor: 'blue',
        //borderWidth: 2,
    },
    forms: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignSelf: 'center',
        width: Dimensions.get('screen').width * 0.9,
        margin: 30,
        marginTop: 10,
        borderColor: 'blue',
        //borderWidth: 2,
    },
    dropdown: {
        width: Dimensions.get('screen').width * 0.45,
        height: 130,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
    },
    dropdownText: {
        fontSize: 16,
        fontFamily: 'Kanit_400Regular', // Ensure correct font is used
        color: '#000', // Text color
    },
    placeholderText: {
        fontSize: 16,
        fontFamily: 'Kanit_400Regular', // Ensure correct font is used
        color: 'gray', // Text color
    },
    inputFieldContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 'fit-content',
        width: 'fit-content',
        marginBottom: 15,
        alignSelf: "flex-start",
        padding: 10,
    },
    textInputField: {
        backgroundColor: '#fff',
        borderRadius: 8,
        width: Dimensions.get('screen').width * 0.45,
        height: 55,
        padding: 12,
        fontSize: 16,
        fontFamily: 'Kanit_400Regular', // Ensure correct font is used
        color: '#000', // Text color
        marginRight: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        elevation: 3,
    },
    heightInputField: {
        backgroundColor: '#fff',
        borderRadius: 8,
        width: Dimensions.get('screen').width * 0.213,
        height: 55,
        padding: 12,
        fontSize: 16,
        fontFamily: 'Kanit_400Regular', // Ensure correct font is used
        color: '#000', // Text color
        marginRight: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        elevation: 3,
    },
    pressedButtonLB: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 55,
        width: 40,
        backgroundColor: "white",
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 10,
        borderBottomRightRadius: 0,
        borderTopRightRadius: 0,
    },
    unPressedButtonLB: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 55,
        width: 40,
        backgroundColor: "transparent",
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 10,
        borderBottomRightRadius: 0,
        borderTopRightRadius: 0,
    },
    pressedButtonKG: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 55,
        width: 40,
        backgroundColor: "white",
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 10,
        borderBottomLeftRadius: 0,
        borderTopLeftRadius: 0,
    },
    unPressedButtonKG: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 55,
        width: 40,
        backgroundColor: "transparent",
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 10,
        borderBottomLeftRadius: 0,
        borderTopLeftRadius: 0,
    },
    pressedButtonLabel: {
        color: global_styles.background_color,
        fontSize: 20,
        fontWeight: 'bold',
    },
    unPressedButtonLabel: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
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

export default IntensityLevelScreen;