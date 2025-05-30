import { useRouter } from 'expo-router';
import { StyleSheet, Text, View, Button} from "react-native";

export default function Page() {
    const router = useRouter();
    return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.subtitle}>Test Screen</Text>
        <Button 
            title="back to login screen"
            onPress={() => {router.push("./tempLoginPage")}}>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
  },
});
