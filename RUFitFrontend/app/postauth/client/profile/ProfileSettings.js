import { View, Text } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from "./styles";

export default function ProfileSettingsScreen() {
    return (
        <View style={styles.container}>
            <LinearGradient colors={['#CC0033', 'darkred']} style={styles.header}>
                <Text style={styles.headerText}>Profile Settings</Text>
            </LinearGradient>
            <View style={styles.contentContainer}>
                <Text style={styles.dataLabel}>Username: <Text style={styles.dataValue}>JohnDoe123</Text></Text>
                <Text style={styles.dataLabel}>Email: <Text style={styles.dataValue}>john.doe@example.com</Text></Text>
                <Text style={styles.dataLabel}>Phone: <Text style={styles.dataValue}>(123) 456-7890</Text></Text>
            </View>
        </View>
    );
}