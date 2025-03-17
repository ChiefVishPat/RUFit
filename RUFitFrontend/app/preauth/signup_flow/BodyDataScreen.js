import { View, Text, StyleSheet, ActivityIndicator, Dimensions, TextInput, Keyboard, KeyboardAvoidingView, Platform } from "react-native"
import { ScaledSheet, moderateScale, scale, verticalScale } from 'react-native-size-matters';
import DropDownPicker from "react-native-dropdown-picker";
import ToggleButton from '../../../components/ToggleButton';
import { useState, useEffect } from "react";
import { global_styles, GradientScreen, ScarletPressable } from "../../GlobalStyles";

import IntensityLevelScreen from "./IntensityLevelScreen";

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

const BodyDataScreen = ({ navigation, route }) => {
    const [fontsLoaded] = useFonts({
        BigShouldersDisplay_700Bold,
        Kanit_400Regular,
    });
    const { email, username, password } = route.params;

    const [LBSelected, setLBSelected] = useState(true);
    const [KGSelected, setKGSelected] = useState(false);

    const [open, setOpen] = useState(false);
    const [genderSelection, setGenderSelection] = useState("");
    const [genderOptions, setGenderOptions] = useState([
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
        { label: "Prefer not to say", value: "other" },
    ]);

    const [weightValue, setWeightValue] = useState(null);
    const [weightUnit, setWeightUnit] = useState("lb");

    const [heightValue1, setHeightValue1] = useState(null);
    const [heightValue2, setHeightValue2] = useState(null);
    const [heightUnit, setHeightUnit] = useState("US");

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
                behavior={Platform.OS === "ios" ? "padding" : "height"} // Adjusts layout for keyboard
                style={styles.keyboardAvoidingContainer}
            >
                <View style={styles.container}>
                    <View style={styles.topText}>
                        <Text style={fontStyles.screenTitle}>Welcome to RUFit!</Text>
                        <Text style={fontStyles.subText}>In order to personalize your experience and help you with your fitness journey, we'll need to gather some information first:</Text>
                    </View>

                    <View style={styles.forms}>
                        <View style={styles.inputFieldContainer}>
                            <DropDownPicker
                                open={open}
                                value={genderSelection}
                                items={genderOptions}
                                setOpen={setOpen}
                                setValue={setGenderSelection}
                                setItems={setGenderOptions}
                                listMode="FLATLIST"
                                placeholder="Gender"
                                style={styles.textInputField}
                                dropDownContainerStyle={styles.dropdown}
                                textStyle={styles.dropdownText}
                                placeholderStyle={styles.placeholderText}
                            />
                        </View>

                        <View style={styles.inputFieldContainer}>
                            <TextInput style={styles.textInputField}
                                placeholder="Body Weight"
                                placeholderTextColor="gray"
                                keyboardType="numeric"
                                inputMode="numeric"
                                value={weightValue}
                                // prevents non-numeric values from being entered:
                                onChangeText={(text) => setWeightValue(text.replace(/[^0-9]/g, ""))}
                                returnKeyType="done" // Adds a "Done" button to the keyboard
                                onSubmitEditing={() => Keyboard.dismiss()} // Dismisses the keyboard when "Done" is pressed
                            >
                            </TextInput>
                            <ToggleButton
                                leftButtonLabel="lb"
                                rightButtonLabel="kg"
                                onPress={(button) => {
                                    if (button == "left") {
                                        setWeightUnit("lb");
                                    }
                                    else {
                                        setWeightUnit("kg");
                                    }
                                }}
                            />
                        </View>

                        <View style={styles.inputFieldContainer}>
                            <TextInput style={styles.heightInputField}
                                placeholder={heightUnit == "US" ? "ft" : "m"}
                                placeholderTextColor="gray"
                                keyboardType="numeric"
                                inputMode="numeric"
                                value={heightValue1}
                                // prevents non-numeric values from being entered:
                                onChangeText={(text) => setHeightValue1(text.replace(/[^0-9]/g, ""))}
                                returnKeyType="done" // Adds a "Done" button to the keyboard
                                onSubmitEditing={() => Keyboard.dismiss()} // Dismisses the keyboard when "Done" is pressed
                                >
                            </TextInput>
                            <TextInput style={styles.heightInputField}
                                placeholder={heightUnit == "US" ? "in" : "cm"}
                                placeholderTextColor="gray"
                                keyboardType="numeric"
                                inputMode="numeric"
                                value={heightValue2}
                                // prevents non-numeric values from being entered:
                                onChangeText={(text) => setHeightValue2(text.replace(/[^0-9]/g, ""))}
                                returnKeyType="done" // Adds a "Done" button to the keyboard
                                onSubmitEditing={() => Keyboard.dismiss()} // Dismisses the keyboard when "Done" is pressed
                                >
                            </TextInput>
                            <ToggleButton
                                leftButtonLabel="US"
                                rightButtonLabel="SI"
                                onPress={(button) => {
                                    if (button == "left") {
                                        setHeightUnit("US");
                                    }
                                    else {
                                        setHeightUnit("SI");
                                    }
                                }}
                            />
                        </View>
                    </View>
                    <View style={styles.navigationBtnContainer}>
                        <ScarletPressable btnText="Next" onPress={() => {
                            navigation.navigate('IntensityLevel', {
                                email: email,
                                username: username,
                                password: password,
                                gender: genderSelection,
                                weight: weightValue,
                                weightUnit: weightUnit,
                                heightValue1: heightValue1,
                                heightValue2: heightValue2,
                                heightUnit: heightUnit,
                            })
                        }}>
                        </ScarletPressable>
                    </View>
                </View>

            </KeyboardAvoidingView>

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
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    topText: {
        flex: 1,
        flexDirection: 'column',
        width: Dimensions.get('screen').width * 0.9,
        margin: 70,
        marginTop: 100,
        padding: 10,
    },
    forms: {
        flex: 1.8,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignSelf: 'center',
        width: Dimensions.get('screen').width * 0.9,
        margin: 30,
        marginTop: 0,
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
        flex: 1,
        width: 'fit-content',
        margin: 20,
        alignItems: 'center',
        justifyContent: 'center',
        //borderColor: 'pink',
        //borderWidth: 2,
    },
});

const fontStyles = ScaledSheet.create({
    screenTitle: {
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

export default BodyDataScreen;