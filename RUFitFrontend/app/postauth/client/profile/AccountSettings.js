import { View, Text, Alert, TouchableOpacity, ScrollView } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from "./styles";
import { useRoute, useNavigation } from "@react-navigation/native";
import { APIClient } from "../../../../components/api/APIClient";

export default function AccountSettingsScreen() {
    const route = useRoute();
    const navigation = useNavigation();

    const handleDeleteAccount = async () => {
        try {
            await APIClient.delete('auth/account', { sendAccess: true });

            Alert.alert(
                "Account deleted",
                "Your account has been successfully deleted.",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            navigation.reset({ index: 0, routes: [{ name: 'PreAuthLanding' }] });
                        }
                    }
                ]
            );

        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to delete account. Please try again.");
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#CC0033', 'darkred']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <Text style={styles.headerText}>Account Options</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} style={{ width: '100%' }}>
                <TouchableOpacity style={styles.bodyDataContainer} onPress={handleDeleteAccount}>
                    <View style={styles.row}>
                        <Text style={[styles.dataLabel, { color: '#FF4C4C', fontWeight: 'bold' }]}>
                            Delete Account
                        </Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
