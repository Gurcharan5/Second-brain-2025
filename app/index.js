import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ToDoScreen() {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [taskName, setTaskName] = useState('');
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false); // Category modal
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false); // Task modal
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(null); // Current category for task addition
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(null); // Track selected category

  // Load categories from AsyncStorage (if any)
  React.useEffect(() => {
    const loadCategories = async () => {
      const storedCategories = await AsyncStorage.getItem('categories');
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      }
    };
    loadCategories();
  }, []);

  // Save categories to AsyncStorage
  const saveCategories = async () => {
    await AsyncStorage.setItem('categories', JSON.stringify(categories));
  };

  // Create a new category
  const addCategory = () => {
    if (categoryName.trim()) {
      const newCategory = { name: categoryName, tasks: [] };
      setCategories([...categories, newCategory]);
      setCategoryName('');
      setIsCategoryModalVisible(false); // Close category modal
      saveCategories();
    }
  };

  // Add a task to the selected category
  const addTask = () => {
    if (taskName.trim() && currentCategoryIndex !== null) {
      const updatedCategories = [...categories];
      updatedCategories[currentCategoryIndex].tasks.push({ name: taskName, completed: false });
      setCategories(updatedCategories);
      setTaskName('');
      setIsTaskModalVisible(false); // Close task modal
      saveCategories();
    }
  };

  // Toggle task completion and set the 5-second delay to remove it
  const toggleTaskCompletion = (categoryIndex, taskIndex) => {
    const updatedCategories = [...categories];
    const task = updatedCategories[categoryIndex].tasks[taskIndex];
    task.completed = !task.completed;

    // If task is marked as completed, set a 5-second timer to remove it
    if (task.completed) {
      setTimeout(() => {
        removeTask(categoryIndex, taskIndex);
      }, 5000); // 5-second delay
    }

    setCategories(updatedCategories);
    saveCategories();
  };

  // Remove task from category
  const removeTask = (categoryIndex, taskIndex) => {
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex].tasks.splice(taskIndex, 1);
    setCategories(updatedCategories);
    saveCategories();
  };

  // Delete category
  const deleteCategory = (categoryIndex) => {
    const updatedCategories = [...categories];
    updatedCategories.splice(categoryIndex, 1);
    setCategories(updatedCategories);
    saveCategories();
  };

  // Handle tapping on a category to show/hide delete button
  const toggleCategorySelection = (index) => {
    setSelectedCategoryIndex(selectedCategoryIndex === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>To-Do List</Text>

      {/* Category List */}
      <FlatList
        data={categories}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View>
            {/* Category */}
            <TouchableOpacity
              style={styles.category}
              onPress={() => toggleCategorySelection(index)} // Toggle category selection
            >
              <Text style={styles.categoryName}>{item.name}</Text>

              {/* Show delete button only if category is selected */}
              {selectedCategoryIndex === index && (
                <TouchableOpacity
                  style={styles.deleteCategoryButton}
                  onPress={() => deleteCategory(index)}
                >
                  <Text style={styles.deleteCategoryButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            {/* Add Task Button for each Category */}
            <TouchableOpacity
              style={styles.addTaskButton}
              onPress={() => {
                setCurrentCategoryIndex(index); // Set the current category index
                setIsTaskModalVisible(true); // Show the Add Task modal
              }}
            >
              <Text style={styles.addTaskButtonText}>Add Task</Text>
            </TouchableOpacity>

            {/* Task List for Each Category */}
            <FlatList
              data={item.tasks}
              keyExtractor={(task, taskIndex) => taskIndex.toString()}
              renderItem={({ item: task, index: taskIndex }) => (
                <View>
                  {/* Task */}
                  <TouchableOpacity
                    onPress={() => toggleTaskCompletion(index, taskIndex)}
                    style={styles.taskRow}
                  >
                    <Text
                      style={[styles.taskText, task.completed && styles.completedTask]}
                    >
                      {task.name}
                    </Text>
                  </TouchableOpacity>

                  {/* Spacer Line */}
                  <View style={styles.lineSpacer} />
                </View>
              )}
            />
          </View>
        )}
      />

      {/* Add Category Button */}
      <TouchableOpacity style={styles.addCategoryButton} onPress={() => setIsCategoryModalVisible(true)}>
        <Text style={styles.addCategoryButtonText}>Add Category</Text>
      </TouchableOpacity>

      {/* Modal for Adding Category */}
      <Modal
        visible={isCategoryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCategoryModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Enter Category Name</Text>
            <TextInput
              style={styles.input}
              value={categoryName}
              onChangeText={setCategoryName}
              placeholder="Category Name"
            />
            <Button title="Add Category" onPress={addCategory} />
            <Button title="Cancel" onPress={() => setIsCategoryModalVisible(false)} color="red" />
          </View>
        </View>
      </Modal>

      {/* Modal for Adding Task */}
      <Modal
        visible={isTaskModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsTaskModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Enter Task Name</Text>
            <TextInput
              style={styles.input}
              value={taskName}
              onChangeText={setTaskName}
              placeholder="Task Name"
            />
            <Button title="Add Task" onPress={addTask} />
            <Button title="Cancel" onPress={() => setIsTaskModalVisible(false)} color="red" />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderBottomWidth: 1, marginBottom: 10, paddingHorizontal: 10, paddingVertical: 5 },
  category: { padding: 10, borderWidth: 1, marginVertical: 5 },
  categoryName: { fontSize: 18 },
  taskRow: { padding: 10 },
  taskText: { fontSize: 16 },
  completedTask: { textDecorationLine: 'line-through', color: 'gray' },
  lineSpacer: { height: 1, backgroundColor: 'lightgray', marginVertical: 5 },
  addCategoryButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'blue',
    borderRadius: 50,
    padding: 15,
  },
  addCategoryButtonText: { color: 'white', fontSize: 20 },
  addTaskButton: {
    marginTop: 10,
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
  },
  addTaskButtonText: { color: 'white', textAlign: 'center', fontSize: 16 },
  deleteCategoryButton: {
    marginTop: 5,
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
  },
  deleteCategoryButtonText: { color: 'white', fontSize: 14, textAlign: 'center' },
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
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
