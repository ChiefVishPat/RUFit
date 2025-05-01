
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { background_color } from "../../GlobalStyles";
import { LinearGradient } from 'expo-linear-gradient'; // or 'react-native-linear-gradient'


export default function ScreenHeader({ title, backButton }) {
    const navigation = useNavigation();
    return (
        <LinearGradient
            colors={['#CC0033', 'darkred']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 15 }}
        >
            {backButton && (
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{
                        position: 'absolute',
                        left: 15,
                        marginTop: 65,
                        zIndex: 1
                    }}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
            )}

            <Text
                style={{
                    color: '#fff',
                    fontSize: 20,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginTop: 50
                }}
            >
                {title}
            </Text>
        </LinearGradient>
    );
}