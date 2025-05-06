import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, FlatList, Alert, Modal, Pressable, Dimensions } from "react-native";
import { useState, useEffect } from "react";
import { TextInput } from "react-native-gesture-handler";
import { useNavigation, useRoute } from "@react-navigation/native";
import { APIClient } from "../../../../components/api/APIClient";
import { background_color, scarlet_red } from "../../../GlobalStyles";
import SearchBar from "./SearchBar";
import { Ionicons } from '@expo/vector-icons';


export default function ExercisesListScreen() {

    const navigation = useNavigation();
    const route = useRoute();

    const [exerciseLoading, setExerciseLoading] = useState(true);
    const [muscleGroupLoading, setMuscleGroupLoading] = useState(true);

    const [exercises, setExercises] = useState();
    const [muscleGroups, setMuscleGroups] = useState();
    const [selectedMuscleGroups, setSelectedMuscleGroups] = useState([]);

    const [searchQuery, setSearchQuery] = useState('');

    const [modalVisible, setModalVisible] = useState(false);
    const [pickerValue, setPickerValue] = useState("Select a group...");
    const [modalSelectedGroups, setModalSelectedGroups] = useState([]);
    const [groupSearchTerm, setGroupSearchTerm] = useState('');





    const toggleGroup = (group) => {
        if (selectedMuscleGroups.includes(group)) {
            setSelectedMuscleGroups(selectedMuscleGroups.filter((g) => g !== group));
        } else {
            setSelectedMuscleGroups([...selectedMuscleGroups, group]);
        }
    };

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const response = await APIClient.get('/exercises', {sendAccess: true});
                setExercises(response.data);
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    ('Error fetching exercises');
                    setExercises([]);
                } else {
                    console.error(error);
                    Alert.alert('Error', 'Failed to fetch exercises');
                }
            }
            finally {
                setExerciseLoading(false);
            }
        };
        fetchExercises();
    }, []);

    useEffect(() => {
        const fetchMuscleGroups = async () => {
            try {
                const response = await APIClient.get('/exercises/muscle-groups', {sendAccess: true});
                setMuscleGroups(response.data);
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    ('Error fetching muscle groups');
                    setExercises([]);
                } else {
                    console.error(error);
                    Alert.alert('Error', 'Failed to fetch muscle groups');
                }
            }
            finally {
                setMuscleGroupLoading(false);
            }
        }
        fetchMuscleGroups();
    }, [])

    const filteredExercises = exerciseLoading
        ? []
        : exercises.filter(ex => {
            const matchesSearch = ex.exercise_name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesMuscleGroup =
                selectedMuscleGroups.length === 0 ||
                ex.muscle_groups.some(group => selectedMuscleGroups.includes(group));
            return matchesSearch && matchesMuscleGroup;
        });


    const renderExercise = ({ item }) => (
        <TouchableOpacity
            style={styles.exerciseCard}
            onPress={() => navigation.navigate("Exercise Description", { exercise: item })}>
            <View style={styles.cardContainer}>
                <View style={styles.nameContainer}>
                    <Text style={styles.exerciseName}>{item.exercise_name}</Text>
                </View>
                <View style={styles.muscleGroupContainer}>
                    {item.muscle_groups.map((group, index) => {
                        const isMatched = selectedMuscleGroups.includes(group);
                        return (
                            <Text
                                key={index}
                                style={[
                                    styles.muscleGroup,
                                    isMatched && styles.matchedMuscleGroup, // 👈 conditional red style
                                ]}
                            >
                                {group}
                            </Text>
                        );
                    })}

                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

            {/* Top: All muscle group options */}
            {muscleGroupLoading ? (
                <ActivityIndicator size="large" color="white" style={styles.loader} />
            ) : (
                <View style={styles.pickerWrapper}>
                    <Text style={styles.filterLabel}>Choose muscle groups:</Text>

                    <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={() => {
                            setGroupSearchTerm('');
                            setModalSelectedGroups(selectedMuscleGroups); // preload selections
                            setModalVisible(true);
                        }}
                    >
                        <Text style={styles.dropdownButtonText}>
                            {selectedMuscleGroups.length > 0 ? `${selectedMuscleGroups.length} selected` : 'Select...'}
                        </Text>
                        <Ionicons name="chevron-down" size={18} color="#ccc" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>

                    <Modal
                        transparent
                        animationType="fade"
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                            <Pressable style={styles.modalContent} onPress={() => { }}>
                                <Text style={styles.modalTitle}>Select Muscle Groups</Text>

                                {/* Search bar */}
                                <View style={styles.searchBar}>
                                    <Ionicons name="search" size={16} color="#aaa" />
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Search..."
                                        placeholderTextColor="#aaa"
                                        value={groupSearchTerm}
                                        onChangeText={setGroupSearchTerm}
                                    />
                                </View>

                                {/* Scrollable list */}
                                <FlatList
                                    data={muscleGroups.filter(group =>
                                        group.toLowerCase().includes(groupSearchTerm.toLowerCase())
                                    )}
                                    keyExtractor={(item) => item}
                                    renderItem={({ item }) => {
                                        const isSelected = modalSelectedGroups.includes(item);
                                        return (
                                            <TouchableOpacity
                                                style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                                                onPress={() => {
                                                    if (isSelected) {
                                                        setModalSelectedGroups(modalSelectedGroups.filter(g => g !== item));
                                                    } else {
                                                        setModalSelectedGroups([...modalSelectedGroups, item]);
                                                    }
                                                }}
                                            >
                                                <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextSelected]}>
                                                    {item}
                                                </Text>
                                                {isSelected && <Ionicons name="checkmark" size={16} color="#FE0040" />}
                                            </TouchableOpacity>
                                        );
                                    }}
                                    style={{ marginVertical: 10, maxHeight: 300 }}
                                />

                                {/* Confirm Button */}
                                <TouchableOpacity
                                    style={styles.confirmButton}
                                    onPress={() => {
                                        setSelectedMuscleGroups(modalSelectedGroups);
                                        setPickerValue('Select a group...');
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.confirmButtonText}>Apply</Text>
                                </TouchableOpacity>
                            </Pressable>
                        </Pressable>
                    </Modal>
                </View>


            )}


            {/* Bottom: Only selected groups */}
            {selectedMuscleGroups.length > 0 && (
                <View style={styles.selectedSection}>
                    <Text style={styles.filterLabel}>Selected:</Text>
                    <View style={[styles.pillContainer, { flexDirection: 'row', flexWrap: 'wrap' }]}>
                        {selectedMuscleGroups.map((group) => (
                            <TouchableOpacity
                                key={group}
                                onPress={() => toggleGroup(group)}
                                style={[styles.pill, styles.selectedPill]}
                            >
                                <Text style={[styles.pillText, styles.selectedPillText]}>{group}</Text>
                                <Ionicons name="close" size={14} color="#fff" style={styles.icon} />
                            </TouchableOpacity>
                        ))}

                    </View>
                </View>
            )}

            {/* Exercises */}
            {exerciseLoading ? (
                <ActivityIndicator size="large" color="#1877F2" style={styles.loader} />
            ) : (
                <FlatList
                    data={filteredExercises}
                    keyExtractor={(item, index) => `${item.exercise_name}-${index}`}
                    renderItem={renderExercise}
                />
            )}
        </View>
    );

}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#1F1F1F',
    },
    nameContainer: {
        flex: 1,
    },
    cardContainer: {
        flex: 1,
        flexDirection: 'column'
    },
    container: {
        flex: 1,
        position: 'relative',
        backgroundColor: background_color,
        padding: 5,
    },
    listContainer: {
        padding: 20,
        paddingBottom: 100,
    },
    exerciseCard: {
        backgroundColor: '#333',
        padding: 15,
        borderRadius: 8,
        margin: 10,
        marginBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    workoutName: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    workoutDetails: {
        color: '#aaa',
        fontSize: 14,
    },
    cardActions: {
        flexDirection: 'row',
    },
    addButton: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#CC0033',
        padding: 20,
        borderRadius: 8,
        shadowColor: 'black',
        shadowOffset: { height: 1, width: 1 },
        shadowOpacity: 1,
        shadowRadius: 3,
        elevation: 2,
    },
    addButtonText: {
        color: 'white',
        marginLeft: 10,
        fontWeight: 'bold',
    },
    emptyMessage: {
        color: '#aaa',
        textAlign: 'center',
        marginTop: 100,
        fontSize: 16,
    },
    exerciseName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        color: 'white',
    },
    muscleGroupContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        marginTop: 15,
    },
    muscleGroup: {
        backgroundColor: "white",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 'bold',
        color: "#333",
        marginRight: 6,
        marginBottom: 6,
    },
    matchedMuscleGroup: {
        backgroundColor: "#DA2A2A",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
        // color: "#333",
        marginRight: 6,
        marginBottom: 6,
      },      
    muscleGroupFilterContainer: {
        borderColor: 'white',
        borderWidth: 2,
        height: 'fit-content',
        marginHorizontal: 10,
        marginBottom: 10,
        paddingVertical: 10,
    },
    pillContainer: {
        marginBottom: 12,
        paddingHorizontal: 12,
        flexDirection: 'row',
        flexWrap: 'wrap',
        rowGap: 15, // ✅ spacing between rows
        columnGap: 10, // ✅ spacing between pills
    },

    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        // backgroundColor: '#E5F0FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },

    pillText: {
        fontSize: 14,
        color: '#1877F2',
        fontWeight: '500',
    },
    selectedPill: {
        // backgroundColor: '#1877F2',
        backgroundColor: "#DA2A2A",
    },
    selectedPillText: {
        color: '#fff',
    },
    icon: {
        marginLeft: 6,
    },
    loader: {
        marginTop: 20,
    },
    selectedSection: {
        borderTopWidth: 1,
        borderTopColor: '#444',
        paddingTop: 10,
        marginTop: 10,
        marginHorizontal: 10,
    },
    filterLabel: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 10,
        marginLeft: 4,
    },
    pickerWrapper: {
        marginHorizontal: 10,
        marginVertical: 10,
        // borderColor: "white", borderWidth: 2
    },
    pickerContainer: {
        backgroundColor: '#1F1F1F',
        borderWidth: 1,
        borderColor: '#444',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 2,
        height: 44, // ✅ Ensure Picker fits nicely
        justifyContent: 'center',
    },
    picker: {
        color: 'white',
        fontSize: 14,
        width: '100%', // ✅ Stretch inside the container
        height: 44,     // ✅ Match container height
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1F1F1F',
        borderWidth: 1,
        borderColor: '#444',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 15,
    },
    dropdownButtonText: {
        color: 'white',
        fontSize: 14,
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#2C2C2C',
        width: '80%',
        borderRadius: 12,
        padding: 16,
        maxHeight: '60%',
    },
    modalTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    modalOption: {
        paddingVertical: 10,
        borderBottomColor: '#444',
        borderBottomWidth: 1,
    },
    modalOptionText: {
        color: 'white',
        fontSize: 15,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3A3A3A',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 10,
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        color: 'white',
        fontSize: 14,
    },
    modalOption: {
        paddingVertical: 10,
        paddingHorizontal: 6,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomColor: '#444',
        borderBottomWidth: 1,
    },
    modalOptionSelected: {
        backgroundColor: '#282828',
    },
    modalOptionText: {
        color: 'white',
        fontSize: 15,
    },
    modalOptionTextSelected: {
        color: scarlet_red,
        fontWeight: '600',
    },
    confirmButton: {
        marginTop: 12,
        backgroundColor: scarlet_red,
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },


});
