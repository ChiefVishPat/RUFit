import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from "./styles";
import { useRoute } from "@react-navigation/native";
import { useState } from "react";
import { Ionicons } from '@expo/vector-icons';
import { APIClient } from "../../../../components/api/APIClient";

export default function ProfileSettingsScreen() {
    const route = useRoute();
    const [userData, setUserData] = useState(route.params?.userData);

    const fieldsToShow = [
        { key: 'email', label: 'Email', readonly: true },
        { key: 'username', label: 'Username', readonly: false },
    ];

    const [editingField, setEditingField] = useState(null);
    const [editedValues, setEditedValues] = useState({ ...userData });
    const [hasEdits, setHasEdits] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleEdit = (field) => {
        setEditingField(field);
    };

    const handleChange = (field, value) => {
        setEditedValues(prev => ({ ...prev, [field]: value }));
        setHasEdits(true);
    };

    const handleBlur = () => {
        setEditingField(null);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                user_data: {
                    ...userData,
                    ...editedValues,
                }
            };

            await APIClient.post('/userinfo', payload, { sendAccess: true });

            setUserData(editedValues);
            setEditingField(null);
            setHasEdits(false);

            Alert.alert('Success', 'Profile settings updated.');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save changes.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#CC0033', 'darkred']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <Text style={styles.headerText}>Profile Settings</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} style={{ width: '100%' }}>
                {fieldsToShow.map((field) => {
                    const { key, label, readonly } = field;

                    return (
                        <View key={key} style={styles.bodyDataContainer}>
                            <View style={styles.row}>
                                <Text style={styles.dataLabel}>{label}</Text>
                                <View style={styles.rightGroup}>
                                    {readonly ? (
                                        <Text style={[styles.dataLabel, styles.dataValue]}>
                                            {userData[key]}
                                        </Text>
                                    ) : editingField === key ? (
                                        <TextInput
                                            style={[styles.dataLabel, styles.dataValueInput]}
                                            value={editedValues[key]}
                                            onChangeText={(text) => handleChange(key, text)}
                                            autoFocus
                                            onBlur={handleBlur}
                                            autoCapitalize="none"
                                        />
                                    ) : (
                                        <Text style={[styles.dataLabel, styles.dataValue]}>
                                            {userData[key]}
                                        </Text>
                                    )}
                                    {!readonly && (
                                        <TouchableOpacity onPress={() => handleEdit(key)}>
                                            <Ionicons name="create-outline" size={20} color="#fff" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            {hasEdits && (
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleSave}
                    disabled={saving}
                >
                    <Text style={styles.addButtonText}>
                        {saving ? "Saving..." : "Save"}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}