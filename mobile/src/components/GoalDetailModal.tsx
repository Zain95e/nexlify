import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Calendar from 'react-native-calendars/src/calendar';
import { Colors } from '../theme';
import api from '../api';

interface GoalDetailModalProps {
  visible: boolean;
  goalId: string | null;
  onClose: () => void;
  onUpdate: () => void;
}

export const GoalDetailModal: React.FC<GoalDetailModalProps> = ({ visible, goalId, onClose, onUpdate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (visible && goalId) {
      fetchGoalDetails();
    } else {
      setData(null);
      setSelectedDate(null);
    }
  }, [visible, goalId]);

  const fetchGoalDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/goals/${goalId}`);
      setData(response.data.data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch goal details.');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await api.patch(`/goals/${goalId}/tasks/${taskId}/complete`);
      fetchGoalDetails();
      onUpdate();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to complete task.');
    }
  };

  if (!visible) return null;

  const markedDates: any = {};
  let selectedTask: any = null;

  if (data?.daily_tasks) {
    const todayStr = new Date().toISOString().split('T')[0];
    
    data.daily_tasks.forEach((task: any) => {
      let color = Colors.muted; // Grey (future or not met yet)
      if (task.completed_count >= task.target_count) {
        color = Colors.success; // Green (met)
      } else if (task.date < todayStr) {
        color = Colors.error; // Red (missed past day)
      }

      markedDates[task.date] = {
        marked: true,
        dotColor: color,
        selected: task.date === selectedDate,
        selectedColor: Colors.primary,
      };

      if (task.date === selectedDate) {
        selectedTask = task;
      }
    });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          {loading && !data ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
          ) : data ? (
            <>
              <View style={styles.header}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.headerTitle} numberOfLines={2}>{data.goal.description}</Text>
                  <Text style={styles.headerSubtitle}>
                    Progress: {data.goal.current_count} / {data.goal.target_count}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.calendarContainer}>
                <Calendar
                  theme={{
                    backgroundColor: Colors.surface,
                    calendarBackground: Colors.surface,
                    textSectionTitleColor: Colors.muted,
                    selectedDayBackgroundColor: Colors.primary,
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: Colors.primary,
                    dayTextColor: Colors.text,
                    textDisabledColor: Colors.border,
                    dotColor: Colors.primary,
                    monthTextColor: Colors.text,
                    indicatorColor: Colors.primary,
                    textDayFontFamily: 'DM Sans',
                    textMonthFontFamily: 'Syne',
                    textDayHeaderFontFamily: 'Syne',
                  }}
                  markedDates={markedDates}
                  onDayPress={(day: any) => {
                    setSelectedDate(day.dateString);
                  }}
                />
              </View>

              {selectedTask && (
                <View style={styles.taskContainer}>
                  <View style={styles.taskHeader}>
                    <Text style={styles.taskDate}>Task for {selectedTask.date}</Text>
                    {selectedTask.is_auto_adjusted && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>Auto-Adjusted</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.taskTarget}>
                    Target: {selectedTask.target_count.toFixed(1)} units
                  </Text>
                  <Text style={styles.taskCompleted}>
                    Completed: {selectedTask.completed_count} units
                  </Text>

                  {selectedTask.completed_count < selectedTask.target_count && selectedTask.date <= new Date().toISOString().split('T')[0] && (
                    <TouchableOpacity 
                      style={styles.completeBtn}
                      onPress={() => handleCompleteTask(selectedTask.id)}
                    >
                      <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                      <Text style={styles.completeBtnText}>Mark +1 Completed</Text>
                    </TouchableOpacity>
                  )}
                  {selectedTask.completed_count >= selectedTask.target_count && (
                    <View style={styles.completedState}>
                      <Ionicons name="checkmark-circle" size={24} color={Colors.success} style={{ marginRight: 8 }} />
                      <Text style={styles.completedStateText}>Target Met!</Text>
                    </View>
                  )}
                </View>
              )}
            </>
          ) : null}
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
    height: '90%',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'Syne',
    color: Colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'DM Sans',
    color: Colors.muted,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  calendarContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  taskContainer: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskDate: {
    fontSize: 16,
    fontFamily: 'Syne',
    fontWeight: '700',
    color: Colors.text,
  },
  badge: {
    backgroundColor: 'rgba(255, 179, 71, 0.2)', // warning/orange
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  badgeText: {
    color: Colors.warning,
    fontSize: 10,
    fontFamily: 'Syne',
    fontWeight: '700',
  },
  taskTarget: {
    fontSize: 14,
    fontFamily: 'DM Sans',
    color: Colors.text,
    marginBottom: 4,
  },
  taskCompleted: {
    fontSize: 14,
    fontFamily: 'DM Sans',
    color: Colors.primary,
    marginBottom: 16,
  },
  completeBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeBtnText: {
    color: '#FFF',
    fontFamily: 'Syne',
    fontWeight: '700',
    fontSize: 14,
  },
  completedState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 212, 170, 0.1)',
    borderRadius: 12,
  },
  completedStateText: {
    color: Colors.success,
    fontFamily: 'Syne',
    fontWeight: '700',
    fontSize: 16,
  },
});
