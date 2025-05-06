import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// Screen that allows the user to scan a barcode to auto-fill macro info
export default function ScanMacroScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation();

  // Request camera permission if not already granted
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  // Reset scanned state when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setScanned(false);
      ("ScanMacroScreen mounted — scanner active");
    }, [])
  );

  // Handle permission/loading UI
  if (!permission) return <Text>Requesting camera permissions...</Text>;
  if (!permission.granted) return <Text>No access to camera. Please enable it in settings.</Text>;

  return (
    <View style={styles.container}>
      {/* Barcode scanner camera view */}
      <CameraView
        onBarcodeScanned={({ data }) => {
          if (!scanned) {
            setScanned(true);
            navigation.navigate('Save Macro', { barcode: data });
          }
        }}
        style={styles.camera}
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
