import { View, Text } from "react-native";
export default function ClientHeader({title}) {
    return (
        <View style={{ backgroundColor: '#CC0033', padding: 15 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 50, }}>
            {title}
        </Text>
    </View>
    );
}


