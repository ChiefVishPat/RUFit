import { View, Text, StyleSheet, ActivityIndicator, Dimensions, KeyboardAvoidingView, Platform } from "react-native";
import { ScaledSheet } from 'react-native-size-matters';
import { useState, useEffect } from "react";
import { GradientScreen } from "../../GlobalStyles";
import ScarletPressable from '../../../components/ui/buttons/ScarletPressable';
import BasicPressable from '../../../components/ui/buttons/BasicPressable';
import VerticalToggleChoice from "../../../components/ui/buttons/VerticalToggleChoice";
import {
    useFonts,
    BigShouldersDisplay_700Bold,
} from '@expo-google-fonts/big-shoulders-display';
import { Kanit_400Regular } from '@expo-google-fonts/kanit';

/**
 * ChooseRoleScreen allows the user to select between "Coach" and "Client" roles.
 * Role is passed forward in navigation params for conditional signup flow.
 */
const ChooseRoleScreen = ({ navigation, route }) => {
    const [fontsLoaded] = useFonts({
        BigShouldersDisplay_700Bold,
        Kanit_400Regular,
    });

    const [chosenRole, setChosenRole] = useState("Client");

    const handleRoleChange = (role) => {
        setChosenRole(role);
    };

    useEffect(() => {
        ("Chosen role: %s", chosenRole);
    }, [chosenRole]);

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
                            selectedIndex={1}
                        />
                    </View>
                </View>
            </KeyboardAvoidingView>

            <View style={styles.navigationBtnContainer}>
                <View style={styles.backBtnContainer}>
                    <BasicPressable
                        disabled={true}
                        btnText="Back"
                        onPress={() => navigation.goBack()}
                    />
                </View>

                <View style={styles.nextBtnContainer}>
                    <ScarletPressable
                        btnText="Next"
                        onPress={() => {
                            navigation.navigate('BodyData', {
                                ...route.params,
                                userRole: chosenRole
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
    toggleContainer: {
        width: Dimensions.get('screen').width * 0.9,
        height: 'fit-content',
        paddingHorizontal: 10,
        marginTop: 80,
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

export default ChooseRoleScreen;
