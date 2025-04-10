import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Button, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HabitsScreen = () => {
  const [habits, setHabits] = useState([]);
  const [isAddHabitModalVisible, setIsAddHabitModalVisible] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [is90DayModalVisible, setIs90DayModalVisible] = useState(false);

  // Load habits from AsyncStorage
  useEffect(() => {
    const loadHabits = async () => {
      const storedHabits = await AsyncStorage.getItem('habits');
      if (storedHabits) {
        setHabits(JSON.parse(storedHabits));
      }
    };
    loadHabits();
  }, []);

  // Save habits to AsyncStorage
  const saveHabits = async () => {
    await AsyncStorage.setItem('habits', JSON.stringify(habits));
  };

  // Add a new habit
  const addHabit = () => {
    if (habitName.trim() === '') return; // Don't add if the name is empty
    const newHabit = {
      name: habitName,
      days: Array(365).fill(false), // Initialize with 365 days of false (not done)
    };
    const updatedHabits = [...habits, newHabit];
    setHabits(updatedHabits);
    saveHabits();
    setHabitName(''); // Clear input field
    setIsAddHabitModalVisible(false); // Close modal
  };

  // Mark a habit as done for today
  const markHabitAsDone = (habitIndex) => {
    if (!habits[habitIndex]) return; // Guard against undefined habit
    const updatedHabits = [...habits];
    const today = new Date();
    const todayIndex = Math.floor((today - new Date(today.getFullYear(), 0, 1)) / (1000 * 60 * 60 * 24)); // Days since Jan 1st

    updatedHabits[habitIndex].days[todayIndex] = true;
    setHabits(updatedHabits);
    saveHabits();
  };

  // Render the past 7 days for each habit
  const renderLast7Days = (habitIndex) => {
    if (!habits[habitIndex]) return null; // Guard against undefined habit
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const daysSinceStart = Math.floor((today - startOfYear) / (1000 * 60 * 60 * 24)); // Number of days since start of year

    const last7Days = habits[habitIndex].days.slice(Math.max(0, daysSinceStart - 6), daysSinceStart + 1);
    return (
      <View style={styles.gridContainer}>
        {last7Days.map((completed, index) => (
          <View
            key={index}
            style={[styles.gridCell, completed ? styles.completedCell : styles.missedCell]} // Apply red for missed days
          />
        ))}
      </View>
    );
  };

  // Render the 90-day grid for the selected habit
  const render90DayGrid = (habitIndex) => {
    if (!habits[habitIndex]) return null; // Guard against undefined habit
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const daysSinceStart = Math.floor((today - startOfYear) / (1000 * 60 * 60 * 24)); // Number of days since start of year

    const last90Days = habits[habitIndex].days.slice(Math.max(0, daysSinceStart - 89), daysSinceStart + 1);

    return (
      <View style={styles.gridContainer}>
        {last90Days.map((completed, index) => (
          <View
            key={index}
            style={[styles.gridCell, completed ? styles.completedCell : styles.missedCell]} // Apply red for missed days
          />
        ))}
      </View>
    );
  };

  // Delete habit
  const deleteHabit = (habitIndex) => {
    // Make sure habitIndex is valid and within bounds of the habits array
    if (habitIndex >= 0 && habitIndex < habits.length) {
      const updatedHabits = habits.filter((_, index) => index !== habitIndex); // Remove habit at the given index
      setHabits(updatedHabits);
      saveHabits();
    }
  };

  // Toggle visibility of habit details (past 90 days and delete button)
  const toggleHabitDetails = (habitIndex) => {
    if (selectedHabit === habitIndex) {
      setSelectedHabit(null); // Hide details if the habit is already selected
    } else {
      setSelectedHabit(habitIndex); // Show details for the clicked habit
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Habit Tracker</Text>

      <FlatList
        data={habits}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.habitContainer}>
            {/* Habit Title: Clickable to show details */}
            <TouchableOpacity onPress={() => toggleHabitDetails(index)}>
              <Text style={styles.habitName}>{item.name}</Text>
            </TouchableOpacity>

            {/* Show last 7 days */}
            {renderLast7Days(index)}

            {/* Complete button */}
            <TouchableOpacity style={styles.completeButton} onPress={() => markHabitAsDone(index)}>
              <Text style={styles.completeButtonText}>Complete</Text>
            </TouchableOpacity>

            {/* Show Past 90 Days if the habit is selected */}
            {selectedHabit === index && (
              <View style={styles.habitDetailsContainer}>
                <TouchableOpacity onPress={() => setIs90DayModalVisible(true)}>
                  <Text style={styles.viewDetailsText}>View Past 90 Days</Text>
                </TouchableOpacity>

                {/* Delete Button */}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteHabit(index)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />

      {/* Modal for 90 Days Grid */}
      <Modal
        visible={is90DayModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIs90DayModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Past 90 Days</Text>
            {selectedHabit !== null && render90DayGrid(selectedHabit)}
            <Button title="Close" onPress={() => setIs90DayModalVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* Modal for adding a new habit */}
      <Modal
        visible={isAddHabitModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddHabitModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Add New Habit</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter habit name"
              value={habitName}
              onChangeText={setHabitName}
            />
            <Button title="Add Habit" onPress={addHabit} />
            <Button title="Cancel" onPress={() => setIsAddHabitModalVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* Add Habit Button */}
      <TouchableOpacity
        style={styles.addHabitButton}
        onPress={() => setIsAddHabitModalVisible(true)} // Open Add Habit Modal
      >
        <Text style={styles.addHabitButtonText}>Add Habit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  habitContainer: { marginBottom: 20 },
  habitName: { fontSize: 18, fontWeight: 'bold' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  gridCell: {
    width: 20,
    height: 20,
    margin: 2,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  completedCell: {
    backgroundColor: 'green', // Green for completed days
  },
  missedCell: {
    backgroundColor: 'red', // Red for missed days
  },
  completeButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  completeButtonText: { color: 'white' },
  viewDetailsText: { color: 'blue', textDecorationLine: 'underline' },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  deleteButtonText: { color: 'white' },
  habitDetailsContainer: { marginTop: 10 },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: {
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  addHabitButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  addHabitButtonText: { color: 'white', fontSize: 18 },
});

export default HabitsScreen;
