import { View, Text, StyleSheet, Dimensions } from "react-native"

const BodyDataView = () => {
    return (
        <View style={styles.container}>
            <Text>
                bodyDataView
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 180,
        height: Dimensions.get('window').height * 0.4,
        width: Dimensions.get('window').width * 0.8,
        borderRadius: 10,
        borderColor: 'white',
        borderWidth: 2,
    }
});

export default BodyDataView;
