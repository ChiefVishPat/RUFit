import { StyleSheet, View, Text, Dimensions, Pressable, ActivityIndicator } from "react-native";
import { useState } from "react";
import {
    useFonts,
    BigShouldersDisplay_700Bold,
} from '@expo-google-fonts/big-shoulders-display';
import { Kanit_400Regular } from '@expo-google-fonts/kanit';

export default function TrainingIntensityToggleBtn({onIntensityChange}) {

    const [fontsLoaded] = useFonts({
        BigShouldersDisplay_700Bold,
        Kanit_400Regular,
    });

    const [intensityLevels, setIntensityLevels] = useState([
        { label: "Amateur", value: true },
        { label: "Experienced", value: false },
        { label: "Professional", value: false },
    ]);

    const getValueByLabel = (labelName) => {
        return intensityLevels.find(level => level.label === labelName)?.value;
    };

    const handlePress = (selectedLabel) => {
        setIntensityLevels(prevOptions =>
            prevOptions.map(option => ({
                ...option,
                value: option.label === selectedLabel, // Set selected level to true, others to false
            }))
        );
        onIntensityChange(selectedLabel); // sets intensity level for parent (IntensityLevelScreen.js)
    };

    if (!fontsLoaded) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Pressable style={getValueByLabel("Amateur") ? styles.filledPressable : styles.unfilledPressable}
                onPress={() => handlePress("Amateur")}
            >
                <Text style={getValueByLabel("Amateur") ? styles.pressableLabelText1 : styles.pressableLabelText2}>Amateur</Text>
            </Pressable>

            <Pressable style={getValueByLabel("Experienced") ? styles.filledPressable : styles.unfilledPressable}
                onPress={() => handlePress("Experienced")}
            >
                <Text style={getValueByLabel("Experienced") ? styles.pressableLabelText1 : styles.pressableLabelText2}>Experienced</Text>
            </Pressable>

            <Pressable style={getValueByLabel("Professional") ? styles.filledPressable : styles.unfilledPressable}
                onPress={() => handlePress("Professional")}
            >
                <Text style={getValueByLabel("Professional") ? styles.pressableLabelText1 : styles.pressableLabelText2}>Professional</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        alignItems: 'center',
        height: 300,
        width: Dimensions.get('window').width * 0.9,
        //borderColor: "white",
        //borderWidth: 2,
        alignSelf: 'center'
    },
    pressableLabelText1: {
        fontSize: 26,
        fontFamily: 'Kanit_400Regular', // Ensure correct font is used
        color: 'darkred', // Text color
    },
    pressableLabelText2: {
        fontSize: 26,
        fontFamily: 'Kanit_400Regular', // Ensure correct font is used
        color: 'white', // Text color
    },
    filledPressable: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 55,
        width: Dimensions.get('window').width * 0.7,
        margin: 20,
        backgroundColor: "white",
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 10,
    },
    unfilledPressable: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 55,
        width: Dimensions.get('window').width * 0.7,
        margin: 20,
        backgroundColor: "transparent",
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 10,
    },
});