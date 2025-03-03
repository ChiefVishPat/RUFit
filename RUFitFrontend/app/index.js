import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import axios from "axios";
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { validate } from "../components/UserTokenValidation"
//import HomeScreen from './postauth/HomeScreen';
//import LoginScreen from './preauth/LoginScreen';

const AppWrapper = () => {
  const Stack = createStackNavigator();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const apiClient = axios.create({
    baseURL: "http://127.0.0.1:5000",
    headers: { 'Content-Type': 'application/json' }
  })

  useEffect(() => {
    const createTestUser = async () => {
      AsyncStorage.setItem('accessToken', 'non-null');
      data = {
        username: "test_user3",
        password: "test_password3"
      }
      apiClient.post("/register", data)
      .then(response => {AsyncStorage.setItem('accessToken', response.data.accessToken)})
      .catch(error => console.error(error));

      console.log("acces token: " + AsyncStorage.getItem('accessToken'));
    };
    createTestUser();
  }, []);

  

  // Testing /register endpoint for flask backend:

  /*
  AsyncStorage.setItem('accessToken', 'non-null');
  AsyncStorage.setItem('refreshToken', 'non-null');
  AsyncStorage.removeItem('accessToken');
  AsyncStorage.removeItem('refreshToken');
  */

  useEffect(() => {
    const checkToken = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (validate(accessToken, refreshToken)){
          setIsAuthenticated(true); // Set the token if it exists
        }
      } catch (error) {
        console.error('Failed to fetch token:', error);
      } finally {
        setIsLoading(false); // Stop loading once the check is complete
      }
    };
    checkToken();
  }, []);

  // Show a loading indicator while checking the token
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Render the appropriate screen based on the token
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isAuthenticated ? (
          // If the token exists, show the HomeScreen
          router.push("./postauth/HomeScreen")
        ) : (
          // If the token does not exist, show the Login screen
          router.push("./preauth/LoginScreen")
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppWrapper;

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
