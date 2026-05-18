import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, Platform, KeyboardAvoidingView, ScrollView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../theme';
import api from '../api';

interface NewGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const NewGoalModal: React.FC<NewGoalModalProps> = ({ visible, onClose, onSave }) => {
  const [description, setDescription] = useState('');
  const [targetCount, setTargetCount] = useState('');
  const [category, setCategory] = useState('');
  const [deadline, setDeadline] = useState(new Date(Date.now() + 86400000 * 7)); // Default 1 week
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async () => {
    setErrorMsg(null);
    if (!description.trim() || !targetCount.trim()) {
      setErrorMsg('Please provide a description and target count.');
      return;
    }

    const target = parseInt(targetCount);
    if (isNaN(target) || target <= 0) {
      setErrorMsg('Target count must be a positive number.');
      return;
    }

    setIsSaving(true);
    try {
      await api.post('/goals', {
        description,
        target_count: target,
        deadline: deadline.toISOString().split('T')[0],
        category
      });
      onSave();
      setDescription('');
      setTargetCount('');
      setCategory('');
      onClose();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Failed to create goal.';
      setErrorMsg(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDeadline(selectedDate);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoid}
          >
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.content}>
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>New Goal</Text>
                  <TouchableOpacity onPress={onClose}>
                    <Ionicons name="close" size={24} color={Colors.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                  
                  {/* Beautiful Inline Error Banner */}
                  {errorMsg && (
                    <View style={styles.errorBanner}>
                      <Ionicons name="alert-circle" size={18} color={Colors.error} />
                      <Text style={styles.errorText} numberOfLines={2}>{errorMsg}</Text>
                      <TouchableOpacity onPress={() => setErrorMsg(null)}>
                        <Ionicons name="close" size={16} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                  )}

                  <TextInput
                    style={styles.input}
                    placeholder="Goal Description (e.g. Read 5 Books)"
                    placeholderTextColor={Colors.muted}
                    value={description}
                    onChangeText={setDescription}
                  />

                  <View style={styles.row}>
                    <TextInput
                      style={[styles.input, { flex: 1, marginRight: 8 }]}
                      placeholder="Target Count"
                      placeholderTextColor={Colors.muted}
                      value={targetCount}
                      onChangeText={setTargetCount}
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={[styles.input, { flex: 1, marginLeft: 8 }]}
                      placeholder="Category (e.g. Reading)"
                      placeholderTextColor={Colors.muted}
                      value={category}
                      onChangeText={setCategory}
                    />
                  </View>

                  <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowDatePicker(true)}>
                    <Ionicons name="calendar-outline" size={20} color={Colors.primary} style={{ marginRight: 8 }} />
                    <Text style={styles.dateText}>
                      Deadline: {deadline.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>

                  {showDatePicker && (
                    <DateTimePicker
                      value={deadline}
                      mode="date"
                      display="default"
                      onChange={onChangeDate}
                      minimumDate={new Date()}
                    />
                  )}

                  <TouchableOpacity 
                    style={styles.saveBtn}
                    onPress={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <Text style={styles.saveBtnText}>Create Goal</Text>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  keyboardAvoid: {
    width: '100%',
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 75, 75, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 75, 75, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: Colors.error,
    fontWeight: '600',
    fontFamily: 'DM-Sans',
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'DM-Sans',
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  dateText: {
    color: Colors.primary,
    fontFamily: 'Syne',
    fontWeight: '700',
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 24 : 8,
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontFamily: 'Syne',
    fontSize: 16,
  },
});
