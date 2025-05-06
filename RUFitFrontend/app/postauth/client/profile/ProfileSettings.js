import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from "./styles";
import { Ionicons } from '@expo/vector-icons';
import { APIClient } from "../../../../components/api/APIClient";
import { useUser } from "../../../../components/user_data/UserContext";

export default function ProfileSettingsScreen() {
    const { userData, refreshUser } = useUser();

    // Only streak_goal is editable now
    const fieldsToShow = [
        { key: 'email',       label: 'Email',       readonly: true  },
        { key: 'username',    label: 'Username',    readonly: true  },
        { key: 'streak_goal', label: 'Streak Goal', readonly: false },
    ];

    const [editingField, setEditingField] = useState(null);
    const [editedValues, setEditedValues]   = useState({ streak_goal: '' });
    const [hasEdits,     setHasEdits]       = useState(false);
    const [saving,       setSaving]         = useState(false);

    // Seed the streak_goal when userData changes
    useEffect(() => {
        if (!userData) return;
        setEditedValues({
            streak_goal: (userData.streak_goal ?? 0).toString(),
        });
        setHasEdits(false);
    }, [userData]);

    const handleEdit   = (field) => setEditingField(field);
    const handleBlur   = ()      => setEditingField(null);
    const handleChange = (field, value) => {
        setEditedValues(v => ({ ...v, [field]: value }));
        setHasEdits(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                user_data: {
                    ...userData,
                    streak_goal: Number(editedValues.streak_goal),
                }
            };
            ('PROFILE UPDATE PAYLOAD:', payload.user_data);
            await APIClient.post('/userinfo', payload, { sendAccess: true });

            const updated = await refreshUser();
            if (updated) {
                setEditedValues({
                    streak_goal: String(updated.streak_goal),
                });
                setHasEdits(false);
            }

            setEditingField(null);
            Alert.alert('Success', 'Profile settings updated.');
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to save changes.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#CC0033', 'darkred']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <Text style={styles.headerText}>Profile Settings</Text>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                style={{ width: '100%' }}
            >
                {fieldsToShow.map(({ key, label, readonly }) => (
                    <View key={key} style={styles.bodyDataContainer}>
                        <View style={styles.row}>
                            <Text style={styles.dataLabel}>{label}</Text>
                            <View style={styles.rightGroup}>
                                {/* Always show readonly text for email & username */}
                                {readonly || editingField !== key ? (
                                    <Text style={[styles.dataLabel, styles.dataValue]}>
                                        {userData[key]}
                                    </Text>
                                ) : (
                                    <TextInput
                                        style={[styles.dataLabel, styles.dataValueInput]}
                                        value={editedValues[key]}
                                        onChangeText={text => handleChange(key, text)}
                                        autoFocus
                                        onBlur={handleBlur}
                                        autoCapitalize="none"
                                        keyboardType={ key === 'streak_goal' ? 'numeric' : 'default' }
                                    />
                                )}
                                {/* Only allow edit icon on streak_goal */}
                                {!readonly && editingField !== key && (
                                    <TouchableOpacity onPress={() => handleEdit(key)}>
                                        <Ionicons name="create-outline" size={20} color="#fff" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                ))}
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
