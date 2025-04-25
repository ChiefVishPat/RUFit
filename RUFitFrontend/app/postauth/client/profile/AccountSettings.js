import { View, Text } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from "./styles";

export default function AccountSettingsScreen() {
    return (
        <View style={styles.container}>
            <LinearGradient colors={['#CC0033', 'darkred']} style={styles.header}>
                <Text style={styles.headerText}>Account Settings</Text>
            </LinearGradient>
            <View style={styles.contentContainer}>
                <Text style={styles.dataLabel}>Account Type: <Text style={styles.dataValue}>Premium</Text></Text>
                <Text style={styles.dataLabel}>Member Since: <Text style={styles.dataValue}>Jan 2024</Text></Text>
                <Text style={styles.dataLabel}>Subscription Status: <Text style={styles.dataValue}>Active</Text></Text>
            </View>
        </View>
    );
}