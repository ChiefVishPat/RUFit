import { View, Text, StyleSheet, ActivityIndicator, Dimensions, TextInput, Keyboard, KeyboardAvoidingView, Platform } from "react-native";
import { ScaledSheet } from 'react-native-size-matters';
import DropDownPicker from "react-native-dropdown-picker";
import HorizontalToggleChoice from "../../../components/ui/HorizontalToggleChoice";
import { useState } from "react";
import { GradientScreen } from "../../GlobalStyles";
import ScarletPressable from '../../../components/ui/buttons/ScarletPressable';
import BasicPressable from '../../../components/ui/buttons/BasicPressable';
import {
    useFonts,
    BigShouldersDisplay_700Bold,
} from '@expo-google-fonts/big-shoulders-display';
import { Kanit_400Regular } from '@expo-google-fonts/kanit';

/**
 * BodyDataScreen collects user body metrics (gender, weight, height)
 * to personalize fitness experience.
 */
const BodyDataScreen = ({ navigation, route }) => {
    const [fontsLoaded] = useFonts({
        BigShouldersDisplay_700Bold,
        Kanit_400Regular,
    });

    const [open, setOpen] = useState(false);
    const [genderSelection, setGenderSelection] = useState("");
    const [genderOptions, setGenderOptions] = useState([
        { label: "Male", value: "MALE" },
        { label: "Female", value: "FEMALE" },
        { label: "Prefer not to say", value: "OTHER" },
    ]);

    const [weightValue, setWeightValue] = useState(null);
    const [weightUnit, setWeightUnit] = useState("LB");

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
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingContainer}
            >
                <View style={styles.container}>
                    <View style={styles.screenTitleContainer}>
                        <Text style={fontStyles.screenTitleText}>Body Data</Text>
                    </View>
                    <View style={styles.subTextContainer}>
                        <Text style={fontStyles.subText}>
                            In order to help personalize your fitness experience with us, we'll need to gather some information first:
                        </Text>
                    </View>

                    <View style={styles.forms}>
                        {/* Gender Picker */}
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

                        {/* Weight Input and Unit Toggle */}
                        <View style={styles.inputFieldContainer}>
                            <TextInput
                                style={styles.textInputField}
                                placeholder="Body Weight"
                                placeholderTextColor="gray"
                                keyboardType="numeric"
                                inputMode="numeric"
                                value={weightValue}
                                onChangeText={(text) => setWeightValue(text.replace(/[^0-9]/g, ""))}
                                returnKeyType="done"
                                onSubmitEditing={() => Keyboard.dismiss()}
                            />
                            <HorizontalToggleChoice
                                leftButtonLabel="lb"
                                rightButtonLabel="kg"
                                onPress={(button) => {
                                    setWeightUnit(button === "left" ? "LB" : "KG");
                                }}
                            />
                        </View>

                        {/* Height Inputs and Unit Toggle */}
                        <View style={styles.inputFieldContainer}>
                            <TextInput
                                style={[styles.textInputField, { width: Dimensions.get('screen').width * 0.213 }]}
                                placeholder={heightUnit === "US" ? "ft" : "m"}
                                placeholderTextColor="gray"
                                keyboardType="numeric"
                                inputMode="numeric"
                                value={heightValue1}
                                onChangeText={(text) => setHeightValue1(text.replace(/[^0-9]/g, ""))}
                                returnKeyType="done"
                                onSubmitEditing={() => Keyboard.dismiss()}
                            />
                            <TextInput
                                style={[styles.textInputField, { width: Dimensions.get('screen').width * 0.213 }]}
                                placeholder={heightUnit === "US" ? "in" : "cm"}
                                placeholderTextColor="gray"
                                keyboardType="numeric"
                                inputMode="numeric"
                                value={heightValue2}
                                onChangeText={(text) => setHeightValue2(text.replace(/[^0-9]/g, ""))}
                                returnKeyType="done"
                                onSubmitEditing={() => Keyboard.dismiss()}
                            />
                            <HorizontalToggleChoice
                                leftButtonLabel="US"
                                rightButtonLabel="SI"
                                onPress={(button) => {
                                    setHeightUnit(button === "left" ? "US" : "SI");
                                }}
                            />
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>

            {/* Navigation Buttons */}
            <View style={styles.navigationBtnContainer}>
                <View style={styles.backBtnContainer}>
                    <BasicPressable
                        disabled={false}
                        btnText="Back"
                        onPress={() => navigation.goBack()}
                    />
                </View>

                <View style={styles.nextBtnContainer}>
                    <ScarletPressable
                        btnText="Next"
                        onPress={() => {
                            navigation.navigate('IntensityLevel', {
                                ...route.params,
                                gender: genderSelection,
                                weight: weightValue,
                                weightUnit: weightUnit,
                                heightValue1: heightValue1,
                                heightValue2: heightValue2,
                                heightUnit: heightUnit,
                            });
                        }}
                    />
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
        marginTop: 50,
        backgroundColor: 'transparent',
    },
    screenTitleContainer: {
        width: Dimensions.get('screen').width * 0.9,
        height: 'fit-content',
        padding: 10,
        marginBottom: 20,
    },
    subTextContainer: {
        width: Dimensions.get('screen').width * 0.9,
        height: 'fit-content',
        paddingHorizontal: 10,
    },
    forms: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignSelf: 'center',
        width: Dimensions.get('screen').width * 0.9,
        margin: 30,
        marginTop: 20,
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
        fontFamily: 'Kanit_400Regular',
        color: '#000',
    },
    placeholderText: {
        fontSize: 16,
        fontFamily: 'Kanit_400Regular',
        color: 'gray',
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
        fontFamily: 'Kanit_400Regular',
        color: '#000',
        marginRight: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        elevation: 3,
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

export default BodyDataScreen;
