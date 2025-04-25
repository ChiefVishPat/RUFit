import { View, Text } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from "./styles";

export default function MyBodyDataScreen() {
    return (
        <View style={styles.container}>
            <LinearGradient colors={['#CC0033', 'darkred']} style={styles.header}>
                <Text style={styles.headerText}>My Body Data</Text>
            </LinearGradient>
            <View style={styles.contentContainer}>
                <Text style={styles.dataLabel}>Height: <Text style={styles.dataValue}>180 cm</Text></Text>
                <Text style={styles.dataLabel}>Weight: <Text style={styles.dataValue}>75 kg</Text></Text>
                <Text style={styles.dataLabel}>Body Fat %: <Text style={styles.dataValue}>15%</Text></Text>
            </View>
        </View>
    );
}