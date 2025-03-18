import { StyleSheet, View, TouchableOpacity, Dimensions, Text, ActivityIndicator } from "react-native";
import React, { useState } from "react";

export default function BasicPressable({ onPress, btnText, disabled }) {
    const [loading, setLoading] = useState(false);

    return (
        <View>
            <TouchableOpacity
                disabled={disabled}
                style={[styles.btn, { opacity: disabled ? 0.3 : 1 }]}
                onPress={onPress}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{btnText}</Text>}
                
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    btnContainer: {
    },
    btn: {
        width: '100%',
        backgroundColor: 'white', // Scarlet red
        opacity: 0.6,
        paddingVertical: 15,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        elevation: 5,
        alignItems: 'center',
    },
    btnText: {
        color: 'darkred',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Kanit_400Regular',
    },
});