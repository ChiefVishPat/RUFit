import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { BlurView } from '@react-native-community/blur';

const ChoiceAlertModal = ({ isVisible, title, message, onConfirm, onCancel }) => {
    ("\n");
    (isVisible);
    (title);
    (message);
    (message);
    ("\n");
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
                <Text style={styles.message}>{message}</Text>
                <View style={styles.btnContainer}>
                    <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={onConfirm}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.buttonText}>Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={onCancel}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.buttonText}>No</Text>
                    </TouchableOpacity>
                </View>
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
    confirmButton: {
        flex: 1,
        marginHorizontal: 10,
        backgroundColor: '#CC0033',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        flex: 1,
        marginHorizontal: 10,
        backgroundColor: 'gray',
        opacity: 0.8,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    btnContainer: {
        //flex: 1,
        alignSelf: 'center',
        justifyContent: 'center',
        width: '90%',
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        //borderColor: 'black',
        // borderWidth: 2,
    },
});

export default ChoiceAlertModal;