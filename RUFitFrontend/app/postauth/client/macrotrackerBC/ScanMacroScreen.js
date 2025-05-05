import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Button } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function ScanMacroScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation();

  
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);


  useFocusEffect(
    React.useCallback(() => {
      setScanned(false);
      console.log("ScanMacroScreen focused — scanner active");
    }, [])
  );


 /* const handleBarCodeScanned = ({ data, type }) => {
    if (scanned) return; // prevent double scans
    console.log(' Scanned:', { type, data });

    setScanned(true);

    Alert.alert('Scanned!', `Type: ${type}\nData: ${data}`, [
      {
        text: 'OK',
        onPress: () => {
          navigation.navigate('Save Macro', { scannedBarcode: data });
        },
      },
    ]);
  };
*/

  // Handle permission/loading UI
  if (!permission) return <Text>Requesting camera permissions...</Text>;
  if (!permission.granted) return <Text>No access to camera. Please enable it in settings.</Text>;

  return (
    <View style={styles.container}>
      <CameraView
        //style={styles.camera}
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
