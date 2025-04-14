import { StyleSheet, Text, Dimensions, TouchableOpacity, View, ActivityIndicator, Animated } from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from 'expo-linear-gradient';

// style={global_styles.screenContainer}
export const background_color = '#1a1717';
export const scarlet_red = "#CC0033";

/*
--------------------------------------------------------------------------------------------
-    Global StyleSheet:                                                                    -
-    Feel free to add any styles that will be used repeatedly throughout the project       -
--------------------------------------------------------------------------------------------
*/ 

export const global_styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: '#1a1717', // Gray background
        //backgroundColor: '#282424', // Gray background
        //backgroundColor: '#84888C', // Gray background
        alignItems: 'center',
        justifyContent: 'center',
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    divider: {
        width: Dimensions.get("screen").width * 0.9,
        height: 1,
        margin: 20,
        backgroundColor: 'white',
    },
    textInputField: {
        backgroundColor: '#fff',
        borderRadius: 8,
        width: Dimensions.get('screen').width * 0.7,
        height: 55,
        alignSelf: "center",
        padding: 12,
        fontSize: 16,
        fontFamily: 'Kanit_400Regular', // Ensure correct font is used
        color: '#000', // Text color
        margin: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        elevation: 3,
    },
});

export const GradientScreen = ({ children }) => {    
    return (
        <LinearGradient
                colors={[background_color, 'darkred']} // Adjust colors as needed
                style={global_styles.screenContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {children}
        </LinearGradient>
    );
}