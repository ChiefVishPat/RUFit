import { StyleSheet, View } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

// style={global_styles.screenContainer}
export const global_styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: '#1a1717', // Gray background
        //backgroundColor: '#282424', // Gray background
        //backgroundColor: '#84888C', // Gray background
        alignItems: 'center',
        justifyContent: 'center'
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
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