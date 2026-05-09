import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Colors, Typography } from '../theme';
import { Input } from './Input';
import { Button } from './Button';
import { Ionicons } from '@expo/vector-icons';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (task: any) => void;
  isLoading?: boolean;
}

const PRIORITIES = ['low', 'medium', 'high'];
const CATEGORIES = ['Dev', 'Work', 'Life', 'Study', 'Fitness'];

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ visible, onClose, onSubmit, isLoading }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('Dev');
  const [deadline, setDeadline] = useState(new Date().toISOString());

  const handleSubmit = () => {
    if (!title) return;
    onSubmit({ title, description, priority, category, deadline });
    // Reset form
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>New Task</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <Input
              label="Task Title"
              placeholder="What needs to be done?"
              value={title}
              onChangeText={setTitle}
            />
            <Input
              label="Description (Optional)"
              placeholder="Add some details..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              containerStyle={{ height: 100 }}
            />

            <Text style={styles.label}>Priority</Text>
            <View style={styles.optionsRow}>
              {PRIORITIES.map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPriority(p)}
                  style={[
                    styles.option,
                    priority === p && { backgroundColor: Colors.primary, borderColor: Colors.primary },
                  ]}
                >
                  <Text style={[styles.optionText, priority === p && { color: '#FFF' }]}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCategory(c)}
                  style={[
                    styles.tag,
                    category === c && { backgroundColor: Colors.tertiary, borderColor: Colors.tertiary },
                  ]}
                >
                  <Text style={[styles.tagText, category === c && { color: '#FFF' }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ScrollView>

          <View style={styles.footer}>
            <Button title="Create Task" onPress={handleSubmit} loading={isLoading} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Syne',
    color: Colors.text,
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.muted,
    marginBottom: 12,
    fontFamily: 'Syne',
    textTransform: 'uppercase',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  option: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.muted,
    fontFamily: 'DM Sans',
  },
  categoryRow: {
    marginBottom: 24,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    backgroundColor: Colors.surface,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.muted,
    fontFamily: 'Syne',
  },
  footer: {
    marginBottom: Platform.OS === 'ios' ? 20 : 0,
  },
});
