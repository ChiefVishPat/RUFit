
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function ModalHeader({ title, backButton }) {
    const navigation = useNavigation();
    return (
        <View style={{ backgroundColor: '#CC0033', padding: 15 }}>

            {/* Back Button */}
            { backButton ? <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', left: 15, marginTop: 10, zIndex: 1}}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 20}}>Done</Text>
            </TouchableOpacity> : null}

            <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 20}}>
                {title}
            </Text>
        </View>
    );
}


