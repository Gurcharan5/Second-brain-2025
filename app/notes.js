import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Button, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotesScreen = () => {
  const [notes, setNotes] = useState([]);
  const [isAddNoteModalVisible, setIsAddNoteModalVisible] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [editingNoteIndex, setEditingNoteIndex] = useState(null);

  // Load notes from AsyncStorage
  useEffect(() => {
    const loadNotes = async () => {
      const storedNotes = await AsyncStorage.getItem('notes');
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      }
    };
    loadNotes();
  }, []);

  // Save notes to AsyncStorage
  const saveNotes = async () => {
    await AsyncStorage.setItem('notes', JSON.stringify(notes));
  };

  // Add a new note
  const addNote = () => {
    if (noteTitle.trim() === '' || noteContent.trim() === '') return; // Don't add if title or content is empty
    const newNote = {
      title: noteTitle,
      content: noteContent,
    };
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    saveNotes();
    setNoteTitle(''); // Clear input fields
    setNoteContent('');
    setIsAddNoteModalVisible(false); // Close modal
  };

  // Delete a note
  const deleteNote = (noteIndex) => {
    const updatedNotes = notes.filter((_, index) => index !== noteIndex);
    setNotes(updatedNotes);
    saveNotes();
  };

  // Show the full note for editing
  const showFullNote = (noteIndex) => {
    setSelectedNote(noteIndex);
    setNoteTitle(notes[noteIndex].title);
    setNoteContent(notes[noteIndex].content);
    setEditingNoteIndex(noteIndex); // Set index to edit this note
  };

  // Save the edited note
  const saveEditedNote = () => {
    if (noteTitle.trim() === '' || noteContent.trim() === '') return; // Don't save if title or content is empty
    const updatedNotes = [...notes];
    updatedNotes[editingNoteIndex] = { title: noteTitle, content: noteContent };
    setNotes(updatedNotes);
    saveNotes();
    setEditingNoteIndex(null); // Reset editing index
    setSelectedNote(null); // Close full note view
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notes</Text>

      <FlatList
        data={notes}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.noteContainer}>
            {/* Note Title with Preview of the first line */}
            <TouchableOpacity onPress={() => showFullNote(index)}>
              <Text style={styles.noteTitle}>{item.title}</Text>
              <Text style={styles.notePreview}>{item.content.split('\n')[0]}</Text>
            </TouchableOpacity>

            {/* Delete Button */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteNote(index)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Modal for adding a new note */}
      <Modal
        visible={isAddNoteModalVisible}
        animationType="slide"
        transparent={false} // Fullscreen Modal
        onRequestClose={() => setIsAddNoteModalVisible(false)}
      >
        <View style={styles.fullscreenModalContainer}>
          <TextInput
            style={styles.fullscreenInputTitle}
            placeholder="Enter note title"
            value={noteTitle}
            onChangeText={setNoteTitle}
          />
          <TextInput
            style={styles.fullscreenInputContent}
            placeholder="Enter note content"
            value={noteContent}
            onChangeText={setNoteContent}
            multiline
          />
          <TouchableOpacity onPress={addNote} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsAddNoteModalVisible(false)}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Modal for viewing and editing a full note */}
      {selectedNote !== null && (
        <Modal
          visible={true}
          animationType="slide"
          transparent={false} // Fullscreen Modal
          onRequestClose={() => setSelectedNote(null)}
        >
          <View style={styles.fullscreenModalContainer}>
            <TextInput
              style={styles.fullscreenInputTitle}
              placeholder="Enter note title"
              value={noteTitle}
              onChangeText={setNoteTitle}
            />
            <TextInput
              style={styles.fullscreenInputContent}
              placeholder="Enter note content"
              value={noteContent}
              onChangeText={setNoteContent}
              multiline
            />
            <TouchableOpacity onPress={saveEditedNote} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedNote(null)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}

      {/* Add Note Button */}
      <TouchableOpacity
        style={styles.addNoteButton}
        onPress={() => setIsAddNoteModalVisible(true)} // Open Add Note Modal
      >
        <Text style={styles.addNoteButtonText}>Add Note</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  noteContainer: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#ccc', paddingBottom: 10 },
  noteTitle: { fontSize: 18, fontWeight: 'bold' },
  notePreview: { fontSize: 14, color: 'gray' },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  deleteButtonText: { color: 'white' },
  fullscreenModalContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    padding: 20,
  },
  fullscreenInputTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
  },
  fullscreenInputContent: {
    fontSize: 18,
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    height: '70%',
  },
  saveButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
    width: '100%',
  },
  saveButtonText: { color: 'white', fontSize: 18 },
  closeButton: {
    backgroundColor: 'gray',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
    width: '100%',
  },
  closeButtonText: { color: 'white', fontSize: 18 },
  addNoteButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  addNoteButtonText: { color: 'white', fontSize: 18 },
});

export default NotesScreen;
