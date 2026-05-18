import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../theme';

interface TaskItemProps {
  task: {
    id: string;
    title: string;
    deadline?: string;
    priority: string;
    category?: string;
    is_completed: boolean;
  };
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onIncomplete?: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete, onDelete, onIncomplete }) => {
  const renderRightActions = (progress: any, dragX: any) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity onPress={() => onDelete(task.id)} style={styles.deleteAction}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash-outline" size={24} color="#FFF" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderLeftActions = (progress: any, dragX: any) => {
    const scale = dragX.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    const isCompleted = task.is_completed;
    const actionColor = isCompleted ? Colors.warning : Colors.success;
    const iconName = isCompleted ? 'arrow-undo-outline' : 'checkmark-circle-outline';

    return (
      <TouchableOpacity 
        onPress={() => isCompleted ? onIncomplete?.(task.id) : onComplete(task.id)} 
        style={[styles.completeAction, { backgroundColor: actionColor }]}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name={iconName} size={24} color="#FFF" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return Colors.error;
      case 'medium': return Colors.warning;
      case 'low': return Colors.success;
      default: return Colors.muted;
    }
  };

  const isOverdue = task.deadline && !task.is_completed && new Date(task.deadline) < new Date();

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
    >
      <View style={[
        styles.container,
        isOverdue && { borderColor: Colors.error, borderLeftWidth: 4, borderLeftColor: Colors.error }
      ]}>
        <TouchableOpacity 
          onPress={() => task.is_completed ? onIncomplete?.(task.id) : onComplete(task.id)}
          style={styles.checkboxContainer}
        >
          <Ionicons 
            name={task.is_completed ? "checkmark-circle" : "ellipse-outline"} 
            size={22} 
            color={task.is_completed ? Colors.success : getPriorityColor(task.priority)} 
          />
        </TouchableOpacity>
        
        <View style={styles.content}>
          <View style={styles.mainInfo}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, task.is_completed && styles.completedText]} numberOfLines={1}>
                {task.title}
              </Text>
              {isOverdue && (
                <Ionicons name="warning" size={14} color={Colors.error} style={{ marginLeft: 6 }} />
              )}
            </View>
            {task.deadline && (
              <Text style={[styles.deadline, isOverdue && { color: Colors.error }]}>
                {isOverdue ? 'Overdue • ' : ''}
                {new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
          </View>

          {task.category && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{task.category}</Text>
            </View>
          )}
        </View>
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    height: 64,
    paddingLeft: 12,
  },
  checkboxContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingRight: 16,
  },
  mainInfo: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    fontFamily: 'DM-Sans-Bold',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: Colors.muted,
  },
  deadline: {
    fontSize: 10,
    color: Colors.muted,
    marginTop: 2,
    fontFamily: 'DM-Sans',
  },
  tag: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '700',
    fontFamily: 'Syne',
  },
  deleteAction: {
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: 64,
    marginVertical: 6,
    borderRadius: 12,
    marginRight: 16,
  },
  completeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: 64,
    marginVertical: 6,
    borderRadius: 12,
    marginLeft: 16,
  },
});
