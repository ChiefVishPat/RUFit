import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Button } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function ScanMacroScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation();

  //ensures that the user has given permission to access camera
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);


  //ensures that camera is mounted
  useFocusEffect(
    React.useCallback(() => {
      setScanned(false);
      console.log("ScanMacroScreen mounted — scanner active");
    }, [])
  );


  // Handle permission/loading UI
  if (!permission) return <Text>Requesting camera permissions...</Text>;
  if (!permission.granted) return <Text>No access to camera. Please enable it in settings.</Text>;

  return (
    //displays camera
    <View style={styles.container}>
      <CameraView
      //should navigate to the tracker log page with the data in the barcode section
        onBarcodeScanned={({data}) => {navigation.navigate('Save Macro', { barcode: data }); }} 
      />
   
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
});