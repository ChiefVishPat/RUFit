import { StyleSheet, Text, Dimensions, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useState } from "react";
import { LinearGradient } from 'expo-linear-gradient';

// style={global_styles.screenContainer}
export const background_color = '#1a1717';

export function ScarletPressable({ onPress, btnText }) {
    const [loading, setLoading] = useState(false);
    const handlePress = () => {
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          onPress(); // Execute actual action
        }, 1200); // 1.5s artificial delay
      };

    return (
        <View style={global_styles.btnContainer}>
            <TouchableOpacity
                style={global_styles.scarletPressableBtn}
                // we need to fix this: once signed up, we should hit the Login endpoint
                // and authenticate the user, then routing to home screen
                onPress={handlePress}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={global_styles.scarletPressableBtnText}>{btnText}</Text>}
                
            </TouchableOpacity>
        </View>
    );
}


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
    btnContainer: {
        width: Dimensions.get('window').width * 0.7,
        marginTop: 20,
    },
    scarletPressableBtn: {
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

export const GradientScreen = ({children}) => (
    <LinearGradient
        colors={['#1a1717', '#610d00']} // Adjust colors as needed
        //colors={['#1a1717', '#610d00']} // Adjust colors as needed
        style={global_styles.screenContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
    >
        {children}
    </LinearGradient>
);