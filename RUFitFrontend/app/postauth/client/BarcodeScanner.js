/* CURRENTLY FIX ISSUES

import { BarCodeScanner } from 'expo-barcode-scanner';
import { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import TopHeader from '../../../components/TopHeader';
import { useRoute } from '@react-navigation/native';

export default function BarcodeScanner({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }) => {
    // data is the barcode (UPC)
    const token = await getJWTToken(); // Get token from auth context or storage

    const res = await fetch('http://<your-flask-url>/api/scan-barcode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ barcode: data })
    });

    const json = await res.json();
    console.log('Scanned food data:', json);
    // You can show the food info or auto-log it
  };

  if (hasPermission === null) return <Text>Requesting permission...</Text>;
  if (hasPermission === false) return <Text>No access to camera</Text>;

  return (
    <BarCodeScanner
      onBarCodeScanned={handleBarCodeScanned}
      style={{ flex: 1 }}
    />
  );
}

*/