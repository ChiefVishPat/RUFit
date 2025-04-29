import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from "./styles";
import { useRoute } from "@react-navigation/native";
import { useState } from "react";
import { Ionicons } from '@expo/vector-icons';
import { APIClient } from "../../../../components/api/APIClient";
import { Alert } from "react-native";

export default function MyBodyDataScreen() {
    const route = useRoute();
    const [userData, setUserData] = useState(route.params?.userData);
    const fieldsToShow = [
        { key: 'height', label: 'Height' },  // Special case
        { key: 'weight', label: 'Weight' },
        { key: 'goal', label: 'Goal' },
        { key: 'training_intensity', label: 'Training Intensity' },
    ];

    const [editingField, setEditingField] = useState(null);
    const [editedValues, setEditedValues] = useState({ ...userData });
    const [hasEdits, setHasEdits] = useState(false);
    const [saving, setSaving] = useState(false);

    const safeParseInt = (value) => {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? 0 : parsed;
    };

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
                    ...editedValues, // merge old and edited values
                }
            };

            // POST the edited user data
            await APIClient.post('/userinfo', payload, { sendAccess: true });

            setUserData(editedValues);
            setEditingField(null);
            setHasEdits(false);

            Alert.alert('Success', 'Your body data has been updated.');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save your data. Please try again.');
        }
        finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#CC0033', 'darkred']} // Adjust colors as needed
                style={styles.welcomeBanner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <Text style={styles.headerText}>My Body Data</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} style={{ width: '100%' }}>
                {fieldsToShow.map(({ key, label }) => {
                    let displayValue = "";

                    if (key === "height") {
                        const ft = editedValues.height_ft || userData.height_ft;
                        const inch = editedValues.height_in || userData.height_in;
                        if (ft || inch) {
                            displayValue = `${ft || 0} ft ${inch || 0} in`;
                        }
                    } else {
                        const rawValue = editedValues[key] || userData[key] || '';

                        // Normalize Goal and Training Intensity
                        if (key === 'goal' || key === 'training_intensity') {
                            displayValue = rawValue
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                .join(' ');
                        } else {
                            displayValue = rawValue;
                        }
                    }


                    return (
                        <View key={key} style={styles.bodyDataContainer}>
                            <View style={styles.row}>
                                <Text style={styles.dataLabel}>{label}</Text>

                                <View style={styles.rightGroup}>
                                    {editingField === key ? (
                                        key === "height" ? (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                                                {/* Feet */}
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Text style={styles.dataLabel}>
                                                        {editedValues.height_ft?.toString() || userData.height_ft?.toString() || '0'} ft
                                                    </Text>
                                                    <View style={{ flexDirection: 'column', marginLeft: 8 }}>
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                const currentFt = safeParseInt(editedValues.height_ft ?? userData.height_ft);
                                                                handleChange('height_ft', currentFt + 1);
                                                            }}
                                                        >
                                                            <Ionicons name="chevron-up" size={20} color="white" />
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                const currentFt = safeParseInt(editedValues.height_ft ?? userData.height_ft);
                                                                if (currentFt > 0) {
                                                                    handleChange('height_ft', currentFt - 1);
                                                                }
                                                            }}
                                                        >
                                                            <Ionicons name="chevron-down" size={20} color="white" />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>

                                                {/* Inches */}
                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 20 }}>
                                                    <Text style={styles.dataLabel}>
                                                        {editedValues.height_in?.toString() || userData.height_in?.toString() || '0'} in
                                                    </Text>
                                                    <View style={{ flexDirection: 'column', marginLeft: 8 }}>
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                let currentFt = safeParseInt(editedValues.height_ft ?? userData.height_ft);
                                                                let currentIn = safeParseInt(editedValues.height_in ?? userData.height_in);

                                                                if (currentIn === 11) {
                                                                    handleChange('height_ft', currentFt + 1);
                                                                    handleChange('height_in', 0);
                                                                } else {
                                                                    handleChange('height_in', currentIn + 1);
                                                                }
                                                            }}
                                                        >
                                                            <Ionicons name="chevron-up" size={20} color="white" />
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                let currentFt = safeParseInt(editedValues.height_ft ?? userData.height_ft);
                                                                let currentIn = safeParseInt(editedValues.height_in ?? userData.height_in);

                                                                if (currentIn === 0) {
                                                                    if (currentFt > 0) {
                                                                        handleChange('height_ft', currentFt - 1);
                                                                        handleChange('height_in', 11);
                                                                    }
                                                                } else {
                                                                    handleChange('height_in', currentIn - 1);
                                                                }
                                                            }}
                                                        >
                                                            <Ionicons name="chevron-down" size={20} color="white" />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>


                                        ) : (
                                            <TextInput
                                                style={[styles.dataLabel, styles.dataValueInput]}
                                                value={displayValue}
                                                onChangeText={(text) => handleChange(key, text)}
                                                autoFocus
                                                onBlur={handleBlur}
                                            />
                                        )
                                    ) : (
                                        <Text style={[styles.dataLabel, styles.dataValue]}>
                                            {displayValue}
                                        </Text>
                                    )}

                                    <TouchableOpacity onPress={() => handleEdit(key)}>
                                        <Ionicons name="create-outline" size={20} color="#fff" />
                                    </TouchableOpacity>
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
