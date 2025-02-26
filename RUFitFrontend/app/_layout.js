import { StyleSheet, Text, View } from "react-native";
import { Slot } from 'expo-router';

export default function Page() {
  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.title}>RU Fit</Text>
            <Slot />
        <Text style={styles.subtitle}>Layout for all pages</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
    backgroundColor: 'black'
  },
  main: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
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
  },
});
