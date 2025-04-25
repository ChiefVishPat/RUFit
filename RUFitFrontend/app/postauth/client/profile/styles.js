import { StyleSheet } from "react-native";
import { background_color } from "../../../GlobalStyles";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: background_color,
        padding: 20,
        alignItems: 'center',
    },
    header: {
        width: '100%',
        paddingVertical: 25,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    contentContainer: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
    },
    dataLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 15,
    },
    dataValue: {
        fontWeight: 'normal',
    },
});
