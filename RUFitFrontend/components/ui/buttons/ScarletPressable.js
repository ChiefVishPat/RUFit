import { StyleSheet, View, TouchableOpacity, Dimensions, Text, ActivityIndicator } from "react-native";
import React, { useState } from "react";

export default function ScarletPressable({ onPress, btnText }) {
    const [loading, setLoading] = useState(false);
    const handlePress = () => {
        setLoading(true);
        const randomDelay = Math.floor(Math.random() * (1000 - 700 + 1)) + 700; // Random number between 700 and 1000
    
        setTimeout(() => {
            setLoading(false);
            onPress(); // Execute actual action
        }, 0);
    };

    return (
        <View>
            <TouchableOpacity
                style={styles.scarletPressableBtn}
                onPress={handlePress}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.scarletPressableBtnText}>{btnText}</Text>}
                
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    btnContainer: {
        //margin: 20,
//        borderColor: 'white',
  //      borderWidth: 2,
    },
    scarletPressableBtn: {
        width: "100%",
        backgroundColor: '#CC0033', // Scarlet red
        paddingVertical: 15,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        elevation: 5,
        alignItems: 'center',
    },
    scarletPressableBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Kanit_400Regular',
    },
});