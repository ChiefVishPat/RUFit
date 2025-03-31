import { View, Text, StyleSheet, ActivityIndicator, Dimensions, TextInput, Keyboard, KeyboardAvoidingView, Platform } from "react-native"
import { ScaledSheet, moderateScale, scale, verticalScale } from 'react-native-size-matters';
import DropDownPicker from "react-native-dropdown-picker";
import HorizontalToggleChoice from "../../../components/ui/HorizontalToggleChoice";
import { useState, useEffect } from "react";
import { global_styles, GradientScreen } from "../../GlobalStyles";
import ScarletPressable from '../../../components/ui/buttons/ScarletPressable';
import BasicPressable from '../../../components/ui/buttons/BasicPressable';
import VerticalToggleChoice from "../../../components/ui/buttons/VerticalToggleChoice";

import {
    useFonts,
    BigShouldersDisplay_700Bold,
} from '@expo-google-fonts/big-shoulders-display';
import { Kanit_400Regular } from '@expo-google-fonts/kanit';


const ChooseRoleScreen = ({ navigation, route }) => {
    const [fontsLoaded] = useFonts({
        BigShouldersDisplay_700Bold,
        Kanit_400Regular,
    });
    
    const [chosenRole, setChosenRole] = useState("Coach");

    const handleRoleChange = (role) => {
        setChosenRole(role);
    };

    useEffect(() => {
        console.log("Chosen role: %s", chosenRole);
      }, [chosenRole]); // Dependency array - effect runs when these values change

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
                        <Text style={fontStyles.screenTitleText}>Welcome to RUFit!</Text>
                    </View>
                    <View style={styles.subTextContainer}>
                        <Text style={fontStyles.subText}>How will you be using this app?</Text>
                    </View>

                    <View style={styles.toggleContainer}>
                        <VerticalToggleChoice
                            onValueChange={handleRoleChange}
                            labels={['Coach', 'Client']}
                            selectedIndex={1} // Option 2 will be selected initially
                        />
                    </View>
                    
                </View>
            </KeyboardAvoidingView>
            <View style={styles.navigationBtnContainer}>

                <View style={styles.backBtnContainer}>
                    <BasicPressable disabled={true} btnText="Back" onPress={() => { navigation.goBack() }}></BasicPressable>
                </View>

                <View style={styles.nextBtnContainer}>
                    <ScarletPressable btnText="Next" onPress={() => {
                        // at some point, we will change this so that choosing "Coach" will direct you to another signup flow
                        // right now, all signups go to Client flow
                        navigation.navigate('BodyData', {
                            ...route.params,
                            userRole: chosenRole
                        })
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
        marginTop: 50,
        backgroundColor: 'transparent',
        //borderColor: 'pink',
        //borderWidth: 2,
    },
    screenTitleContainer: {
        width: Dimensions.get('screen').width * 0.9,
        height: 'fit-content',
        padding: 10,
        marginBottom: 20,
        //borderColor: 'blue',
        //borderWidth: 2,
    },
    subTextContainer: {
        width: Dimensions.get('screen').width * 0.9,
        height: 'fit-content',
        paddingHorizontal: 10,
        //borderColor: 'blue',
        //borderWidth: 2,
    },
    toggleContainer: {
        width: Dimensions.get('screen').width * 0.9,
        height: 'fit-content',
        paddingHorizontal: 10,
        marginTop: 80,
        //borderColor: 'blue',
        //borderWidth: 2,
    },
    forms: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignSelf: 'center',
        width: Dimensions.get('screen').width * 0.9,
        margin: 30,
        marginTop: 20,
        //borderColor: 'blue',
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

export default ChooseRoleScreen;