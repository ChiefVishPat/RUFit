
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function ScreenHeader({ title, backButton }) {
    const navigation = useNavigation();
    return (
        <View style={{ backgroundColor: '#CC0033', padding: 15 }}>

            {/* Back Button */}
            { backButton ? <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', left: 15, marginTop: 65, zIndex: 1}}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity> : null}

            <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 50}}>
                {title}
            </Text>
        </View>
    );
}


