import { View, Button, StyleSheet, Text } from "react-native";
import { useRoute } from "@react-navigation/native";

export default function AccountSettings() {

    const route = useRoute();
    const navigation = route.params.navigation;

    return (
        <View style={styles.container}>
            <Button title="go back"
                onPress={() => navigation.goBack()}>
            </Button>
            <Text>hi</Text>
        </View>
    );


}

const styles = StyleSheet.create({
    container: {
        //flex: 1,
        //flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
        backgroundColor: 'black',
        //borderColor: 'pink',
        //borderWidth: 2,
    },
});