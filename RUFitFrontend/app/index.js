import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStackNavigator } from '@react-navigation/stack';
import { validate } from "../components/authentication/user_auth/UserTokenValidation"
import AppNavigator from '../AppNavigator';
//import LoginScreen from './preauth/LoginScreen';
import { handleAuthAccess } from '../components/authentication/user_auth/UserTokenValidation';
import { AppRegistry } from 'react-native';
import App from '../App'; // Import the App component
import { name as appName } from '../app.json';

// Register App.js, which contains AppNavigator, which registers all screens to navigation
AppRegistry.registerComponent(appName, () => App);

const Stack = createStackNavigator();


const AppWrapper = () => {
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // initially set to false, before auth check

  const apiClient = axios.create({
    baseURL: "http://127.0.0.1:5000",
    headers: { 'Content-Type': 'application/json' }
  })

  // testing user registration and login response:

  /*
  useEffect(() => {
    const createTestUser = async () => {
      try {
        const userData = {
          username: "test_user14",
          password: "test_password14"
        };
        const response = await apiClient.post("/register", userData)
        .then(response => {
          console.log(response.data['message']);
        });
      
        const loginResponse = await apiClient.post("/login", userData)
        .then(response => {
          console.log(response.data['access_token']);
          AsyncStorage.setItem('accessToken', response.data['access_token']);
        });

      } catch (error) {
        console.error("Error creating test user:", error);
      }
      const aToken = await AsyncStorage.getItem('accessToken');
      console.log("access token: " + aToken);
    };
    createTestUser();
  }, []);
  
  */

  

  // Testing /register endpoint for flask backend:

  /*
  AsyncStorage.setItem('accessToken', 'non-null');
  AsyncStorage.setItem('refreshToken', 'non-null');
  AsyncStorage.removeItem('accessToken');
  AsyncStorage.removeItem('refreshToken');
  */

  // validates existing tokens. If they do not exist or refresh has expired, user is no longer authenticated
  useEffect(() => {
    const checkToken = async () => {
      try {
        //await AsyncStorage.removeItem('access_token');
        //await AsyncStorage.removeItem('refresh_token');
        const accessToken = await AsyncStorage.getItem('access_token');
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        console.log(accessToken);
        console.log(refreshToken);
        if (await handleAuthAccess(accessToken, refreshToken)){
          console.log("index.js is setting auth to true");
          setIsAuthenticated(true); // Set the token if it exists
        }
        else{
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Failed to fetch token:', error);
      } finally {
        setIsLoading(false); // Stop loading once the check is complete
      }
      console.log(`index.js: ${isAuthenticated}`);
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
    <AppNavigator isAuthenticated={isAuthenticated} />
  );
};

export default AppWrapper;

/*
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
*/