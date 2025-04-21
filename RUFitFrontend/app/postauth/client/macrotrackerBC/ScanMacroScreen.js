import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import * as Camera from 'expo-camera';
import { useNavigation } from '@react-navigation/native';

export default function ScanMacroScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      console.log("Requesting camera permission...");
      const { status } = await Camera.requestCameraPermissionsAsync();
      console.log("Permission status:", status);
      setHasPermission(status === 'granted');
    })();
  }, []);
  

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    Alert.alert("Barcode scanned", `Type: ${type}, Data: ${data}`, [
      {
        text: 'OK',
        onPress: () => {
          setScanned(false); // reset for another scan
          navigation.navigate('Save Macro', { scannedBarcode: data });
        },
      },
    ]);
  };

  if (hasPermission === null) return <Text>Requesting camera permission...</Text>;
  if (hasPermission === false) return <Text>No access to camera</Text>;

  return (
    <View style={styles.container}>
      <Camera.Camera
        style={styles.camera}
        type={Camera.Constants.Type.back}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        ref={cameraRef}
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
