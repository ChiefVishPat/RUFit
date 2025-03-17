import { StyleSheet, View, Pressable, Text } from "react-native";
import { useState } from "react";
import { global_styles } from "../app/GlobalStyles";

export default function ToggleButton({
    leftButtonLabel,
    rightButtonLabel,
    onPress // This will now accept a parameter indicating which button was pressed
}) {

    const styles = StyleSheet.create({
        toggleButtonContainer: {
            flex: 1,
            flexDirection: "row",
            alignItems: 'center',
            justifyContent: 'center'
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
    });

    const [leftSelected, setLeftSelected] = useState(true);
    const [rightSelected, setRightSelected] = useState(false);

    const handlePress = (isLeftButton) => {
        if (isLeftButton) {
            setLeftSelected(true);
            setRightSelected(false);
        } else {
            setLeftSelected(false);
            setRightSelected(true);
        }
        onPress(isLeftButton ? 'left' : 'right'); // Pass the button information to the parent
    };

    return (
        <View style={styles.toggleButtonContainer}>
            <Pressable
                style={leftSelected ? styles.pressedButtonLB : styles.unPressedButtonLB}
                onPress={() => handlePress(true)} // Pass true for left button
            >
                <Text style={leftSelected ? styles.pressedButtonLabel : styles.unPressedButtonLabel}>
                    {leftButtonLabel}
                </Text>
            </Pressable>
            <Pressable
                style={rightSelected ? styles.pressedButtonKG : styles.unPressedButtonKG}
                onPress={() => handlePress(false)} // Pass false for right button
            >
                <Text style={rightSelected ? styles.pressedButtonLabel : styles.unPressedButtonLabel}>
                    {rightButtonLabel}
                </Text>
            </Pressable>
        </View>
    );
}