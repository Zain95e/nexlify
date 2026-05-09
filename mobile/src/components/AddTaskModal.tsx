import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(deadline);
      newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setDeadline(newDate);
    }
  };

  const onChangeTime = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const newDate = new Date(deadline);
      newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      setDeadline(newDate);
    }
  };

  const handleSubmit = () => {
    if (!title) return;
    onSubmit({ title, description, priority, category, deadline: deadline.toISOString() });
    // Reset form
    setTitle('');
    setDescription('');
    setDeadline(new Date());
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

            <Text style={styles.label}>Deadline</Text>
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity style={styles.dateTimeBtn} onPress={() => setShowDatePicker(true)}>
                <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
                <Text style={styles.dateTimeText}>{deadline.toLocaleDateString()}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dateTimeBtn} onPress={() => setShowTimePicker(true)}>
                <Ionicons name="time-outline" size={18} color={Colors.primary} />
                <Text style={styles.dateTimeText}>
                  {deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={deadline}
                mode="date"
                display="default"
                onChange={onChangeDate}
              />
            )}
            {showTimePicker && (
              <DateTimePicker
                value={deadline}
                mode="time"
                display="default"
                onChange={onChangeTime}
              />
            )}

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
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  dateTimeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  dateTimeText: {
    color: Colors.text,
    fontFamily: 'DM Sans',
    fontSize: 14,
    fontWeight: '500',
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
