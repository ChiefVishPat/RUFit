import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { styles } from './styles';
import { Ionicons } from '@expo/vector-icons';
import { APIClient } from '../../../../components/api/APIClient';
import { useUser } from '../../../../components/user_data/UserContext';

export default function MyBodyDataScreen() {
    const { userData, refreshUser } = useUser();

    const fieldsToShow = [
        { key: 'height', label: 'Height' },
        { key: 'weight', label: 'Weight' },
        { key: 'goal', label: 'Goal' },
        { key: 'training_intensity', label: 'Training Intensity' },
    ];

    const goalOptions = ['DEFICIT', 'SURPLUS', 'MAINTAIN'];
    const intensityOptions = ['AMATEUR', 'EXPERIENCED', 'PROFESSIONAL'];

    const [editingField, setEditingField] = useState(null);
    const [editedValues, setEditedValues] = useState({});
    const [hasEdits, setHasEdits] = useState(false);
    const [saving, setSaving] = useState(false);

    // Utility to parse numbers safely
    const safeParseInt = value => {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? 0 : parsed;
    };
    const safeParseFloat = value => {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    };

    // Seed edited values when userData changes
    useEffect(() => {
        if (!userData) return;
        setEditedValues({
            height_ft: (userData.height_ft ?? 0).toString(),
            height_in: (userData.height_in ?? 0).toString(),
            weight: (userData.weight ?? 0).toString(),
            goal: userData.goal ?? goalOptions[0],
            training_intensity: userData.training_intensity ?? intensityOptions[0],
        });
        setHasEdits(false);
    }, [userData]);

    const handleEdit = field => setEditingField(field);
    const handleBlur = () => setEditingField(null);
    const handleChange = (field, value) => {
        setEditedValues(prev => ({ ...prev, [field]: value }));
        setHasEdits(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                user_data: {
                    ...userData,
                    height_ft: safeParseInt(editedValues.height_ft),
                    height_in: safeParseInt(editedValues.height_in),
                    weight: safeParseFloat(editedValues.weight),
                    goal: editedValues.goal,
                    training_intensity: editedValues.training_intensity,
                },
            };
            await APIClient.post('/userinfo', payload, { sendAccess: true });

            const updated = await refreshUser();
            if (updated) {
                setEditedValues({
                    height_ft: (updated.height_ft ?? 0).toString(),
                    height_in: (updated.height_in ?? 0).toString(),
                    weight: (updated.weight ?? 0).toString(),
                    goal: updated.goal ?? goalOptions[0],
                    training_intensity: updated.training_intensity ?? intensityOptions[0],
                });
                setHasEdits(false);
            }

            setEditingField(null);
            Alert.alert('Success', 'Your body data has been updated.');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save your data. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (!userData) return null;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#CC0033', 'darkred']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <Text style={styles.headerText}>My Body Data</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} style={{ width: '100%' }}>
                {fieldsToShow.map(({ key, label }) => {
                    let displayValue = '';
                    if (key === 'height') {
                        displayValue = `${editedValues.height_ft} ft ${editedValues.height_in} in`;
                    } else if (key === 'weight') {
                        displayValue = editedValues.weight;
                    } else {
                        const raw = editedValues[key] ?? '';
                        displayValue = raw
                            .split(' ')
                            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                            .join(' ');
                    }

                    return (
                        <View key={key} style={styles.bodyDataContainer}>
                            <View style={styles.row}>
                                <Text style={styles.dataLabel}>{label}</Text>
                                <View style={styles.rightGroup}>
                                    {editingField === key ? (
                                        key === 'height' ? (
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                {/* Feet selector */}
                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
                                                    <TouchableOpacity
                                                        onPress={() => handleChange('height_ft', (safeParseInt(editedValues.height_ft) + 1).toString())}
                                                    >
                                                        <Ionicons name="chevron-up" size={20} color="#fff" />
                                                    </TouchableOpacity>
                                                    <Text style={[styles.dataLabel, styles.dataValue, { marginHorizontal: 8 }]}>
                                                        {editedValues.height_ft}
                                                    </Text>
                                                    <TouchableOpacity
                                                        onPress={() => handleChange('height_ft', Math.max(safeParseInt(editedValues.height_ft) - 1, 0).toString())}
                                                    >
                                                        <Ionicons name="chevron-down" size={20} color="#fff" />
                                                    </TouchableOpacity>
                                                    <Text style={[styles.dataLabel, styles.dataValue, { marginLeft: 4 }]}>ft</Text>
                                                </View>
                                                {/* Inches selector */}
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            let inch = safeParseInt(editedValues.height_in) + 1;
                                                            let ft = safeParseInt(editedValues.height_ft);
                                                            if (inch > 11) { inch = 0; ft += 1; handleChange('height_ft', ft.toString()); }
                                                            handleChange('height_in', inch.toString());
                                                        }}
                                                    >
                                                        <Ionicons name="chevron-up" size={20} color="#fff" />
                                                    </TouchableOpacity>
                                                    <Text style={[styles.dataLabel, styles.dataValue, { marginHorizontal: 8 }]}>
                                                        {editedValues.height_in}
                                                    </Text>
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            let inch = safeParseInt(editedValues.height_in) - 1;
                                                            let ft = safeParseInt(editedValues.height_ft);
                                                            if (inch < 0) {
                                                                if (ft > 0) { ft -= 1; inch = 11; handleChange('height_ft', ft.toString()); }
                                                                else inch = 0;
                                                            }
                                                            handleChange('height_in', inch.toString());
                                                        }}
                                                    >
                                                        <Ionicons name="chevron-down" size={20} color="#fff" />
                                                    </TouchableOpacity>
                                                    <Text style={[styles.dataLabel, styles.dataValue, { marginLeft: 4 }]}>in</Text>
                                                </View>
                                            </View>
                                        ) : key === 'goal' ? (
                                            <Picker
                                                selectedValue={editedValues.goal}
                                                onValueChange={(val) => handleChange('goal', val)}
                                                style={styles.picker}
                                            >
                                                {goalOptions.map(opt => (
                                                    <Picker.Item style={styles.pickerItem} key={opt} label={opt.charAt(0) + opt.slice(1).toLowerCase()} value={opt} />
                                                ))}
                                            </Picker>
                                        ) : key === 'training_intensity' ? (
                                            <Picker
                                                selectedValue={editedValues.training_intensity}
                                                onValueChange={(val) => handleChange('training_intensity', val)}
                                                style={styles.picker}
                                            >
                                                {intensityOptions.map(opt => (
                                                    <Picker.Item style={styles.pickerItem} key={opt} label={opt.charAt(0) + opt.slice(1).toLowerCase()} value={opt} />
                                                ))}
                                            </Picker>
                                        ) : (
                                            <TextInput
                                                style={[styles.dataLabel, styles.dataValueInput]}
                                                value={editedValues.weight}
                                                onChangeText={text => handleChange('weight', text)}
                                                autoFocus
                                                onBlur={handleBlur}
                                                keyboardType="numeric"
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
                        {saving ? 'Saving...' : 'Save'}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}
