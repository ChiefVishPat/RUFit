import { View, Text, StyleSheet, ActivityIndicator, Dimensions, KeyboardAvoidingView, Platform } from "react-native"
import { ScaledSheet, } from 'react-native-size-matters';
import { useState } from "react";
import { global_styles, GradientScreen } from "../../GlobalStyles";
import ScarletPressable from '../../../components/ui/buttons/ScarletPressable';
import BasicPressable from '../../../components/ui/buttons/BasicPressable';
import TrainingIntensityToggleBtn from "../../../components/ui/buttons/TrainingIntensityToggleBtn";

import {
    useFonts,
    BigShouldersDisplay_700Bold,
} from '@expo-google-fonts/big-shoulders-display';
import { Kanit_400Regular } from '@expo-google-fonts/kanit';


const IntensityLevelScreen = ({ navigation, route }) => {
    const [fontsLoaded] = useFonts({
        BigShouldersDisplay_700Bold,
        Kanit_400Regular,
    });

    const [chosenIntensity, setChosenIntensity] = useState("Amateur");

    const handleIntensityChange = (intensityLevel) => {
        setChosenIntensity(intensityLevel);
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
                            onValueChange={handleIntensityChange}
                            Label1="Amateur"                                
                            Label2="Experienced"                                
                            Label3="Professional">                                
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