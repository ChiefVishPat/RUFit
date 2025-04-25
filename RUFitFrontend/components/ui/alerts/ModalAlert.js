import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { BlurView } from '@react-native-community/blur';

const ModalAlert = ({ isVisible, title, message, onClose }) => {
  console.log("\n");
  console.log(isVisible);
  console.log(title);
  console.log(message);
  console.log(message);
  console.log("\n");
  return (
    <Modal
      isVisible={isVisible}
      animationIn="fadeIn"
      animationOut="fadeOut"
      backdropTransitionOutTiming={0}
      style={styles.modal}
    >
      {/* Blurred Background */}
      <BlurView
        style={styles.blurView}
        blurType="light"
        blurAmount={5}
        reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.7)"
      />

      {/* Alert Content */}
      <View style={styles.alertContainer}>
        {title && <Text style={styles.title}>{title}</Text>}
        <Text style={styles.message}>
          {typeof message === 'string' ? message : message?.message || String(message)}
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  alertContainer: {
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ModalAlert;