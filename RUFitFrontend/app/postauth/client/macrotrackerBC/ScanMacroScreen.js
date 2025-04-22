
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Button } from 'react-native';
import { CameraView, useCameraPermissions, onBarcodeScanned } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';

export default function ScanMacroScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

const handleBarCodeScanned = ({ data, type }) => {
  console.log('📦 Scanned:', { type, data });
  Alert.alert('Scanned!', `Type: ${type}\nData: ${data}`);
  setScanned(true); // disable after one scan (optional)
};


  if (!permission) {
    return <Text>Requesting camera permissions...</Text>;
  }

  if (!permission.granted) {
    return <Text>No access to camera. Please enable it in settings.</Text>;
  }

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={handleBarCodeScanned}
        style={styles.camera}
        barcodeScannerSettings={{
          barCodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
        }}
   
      />
      {scanned && <Button title="Tap to Scan Again" onPress={() => setScanned(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
});
