import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

/**
 * ModalHeader component with an optional "Done" back button and a centered title.
 */
export default function ModalHeader({ title, backButton }) {
    const navigation = useNavigation();

    return (
        <View style={{ backgroundColor: '#CC0033', padding: 15 }}>

            {/* Back Button */}
            {backButton ? (
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ position: 'absolute', left: 15, marginTop: 10, zIndex: 1 }}
                >
                    <Text style={{
                        color: '#fff',
                        fontSize: 20,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginTop: 20
                    }}>
                        Done
                    </Text>
                </TouchableOpacity>
            ) : null}

            {/* Centered Title */}
            <Text style={{
                color: '#fff',
                fontSize: 20,
                fontWeight: 'bold',
                textAlign: 'center',
                marginTop: 20
            }}>
                {title}
            </Text>
        </View>
    );
}
