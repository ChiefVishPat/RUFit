import { useRouter } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, TextInput } from "react-native";
import { useFonts, OpenSans_600SemiBold, OpenSans_400Regular } from '@expo-google-fonts/open-sans';

export default function Page() {
    // ensures that fonts load in before they are displayed
    const [fontsLoaded] = useFonts({
        OpenSans_600SemiBold,
        OpenSans_400Regular
      });
    const router = useRouter();
    const RutgersLogo = require("../../assets/images/Rutgers_Scarlet_Knights_logo.svg.png")
    
    if (!fontsLoaded) {
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
          </View>
        );
      }

    return (
        <>
            <View style={styles.topContainer}>
                <Image
                    source={RutgersLogo}
                    style={styles.logo}>
                </Image>
                <Text style={styles.appName}>RUFit</Text>
            </View>
            <View style={styles.inputContainer}>
            <TextInput
                style={styles.inputField}
                placeholder="Enter your text"
                value="Username"
                // onChangeText={setText}
            />
            </View>
        </>
  );
}

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignContent: "flex-start",
    borderColor: "blue",
    borderWidth: 2,
    height: 100,
  },
  inputContainer: {
    borderColor: "green",
    borderWidth: 2,
    height: 500,
  },
  testScreenBtn: {
    height: "40",
    width: "100",
    margin: 10,
    borderColor: "white",
    borderWidth: 0.7, 
    borderRadius: 40,
    alignContent: 'center',
    justifyContent: "center",
    alignSelf: "center"
  },
  testScreenBtnText:{
    fontSize: 10,
    fontFamily: "OpenSans_400Regular",
    color: "white",
    alignSelf: "center",

  },
  inputField: {
    alignSelf: "center",
    margin: 20,
    borderColor: "white",
    borderWidth: 0.8,
    borderRadius: 5,
    height: 30,
    width: 200,
    
  },
  logo: {
    marginTop: 50,
    height: 100,
    width: 100,
    padding: 10,
    alignSelf: "center",
    //borderColor: "pink",
    //borderWidth: 2
  },
  appName: {

    alignSelf: "center",
    height: "fit-content",
    fontSize: 50,
    fontFamily: "OpenSans_600SemiBold",
    color: "white",
    //borderColor: "pink",
    //borderWidth: 2
  }
});
