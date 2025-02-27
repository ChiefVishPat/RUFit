import { StyleSheet, Text, View, StatusBar,  } from "react-native";
import { Slot } from 'expo-router';

export default function Layout({children}) {
  return (
    <View style={styles.container}>
        <StatusBar
            barStyle={'light-content'}
            backgroundColor={'#000'}
        />
        <Slot/>
    </View>

    // {children}
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        padding: 24,
        backgroundColor: 'black',
        borderColor: "pink",
        borderWidth: 2
      },
      title: {
        marginTop: 40,
        fontSize: 64,
        fontWeight: "bold",
        color: "white",
        borderColor: "red",
        borderWidth: 3,
        textAlign: 'center'
      },
      subtitle: {
        fontSize: 36,
        color: "white",
      }
})


