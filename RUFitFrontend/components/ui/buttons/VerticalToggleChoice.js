import { StyleSheet, View, Text, Dimensions, Pressable, ActivityIndicator } from "react-native";
import { useState } from "react";
import {
    useFonts,
    BigShouldersDisplay_700Bold,
} from '@expo-google-fonts/big-shoulders-display';
import { Kanit_400Regular } from '@expo-google-fonts/kanit';

export default function VerticalToggleChoice({ onValueChange, labels, selectedIndex = 0 }) {
    const [fontsLoaded] = useFonts({
        BigShouldersDisplay_700Bold,
        Kanit_400Regular,
    });

    // Initialize levels based on the labels array
    const [levels, setLevels] = useState(
        labels.map((label, index) => ({
            label,
            value: index === selectedIndex // Only the selectedIndex is true initially
        }))
    );

    const getValueByLabel = (labelName) => {
        return levels.find(level => level.label === labelName)?.value;
    };

    const handlePress = (selectedLabel) => {
        setLevels(prevOptions =>
            prevOptions.map(option => ({
                ...option,
                value: option.label === selectedLabel, // Set selected level to true, others to false
            }))
        );
        onValueChange(selectedLabel);
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
            {levels.map((level) => (
                <Pressable 
                    key={level.label}
                    style={level.value ? styles.filledPressable : styles.unfilledPressable}
                    onPress={() => handlePress(level.label)}
                >
                    <Text style={level.value ? styles.pressableLabelText1 : styles.pressableLabelText2}>
                        {level.label}
                    </Text>
                </Pressable>
            ))}
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
        //flex: 1,
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
        //flex: 1,
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