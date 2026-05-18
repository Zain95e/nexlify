import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Colors } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';

interface TaskItemProps {
  task: {
    id: string;
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    is_completed: boolean;
    deadline?: string;
    category?: string;
    created_at?: string;
  };
  onComplete: (id: string) => void;
  onIncomplete?: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete, onIncomplete, onDelete }) => {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity 
        onPress={() => {
          swipeableRef.current?.close();
          onDelete(task.id);
        }} 
        style={styles.deleteAction}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash-outline" size={24} color="#FFF" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    const isCompleted = task.is_completed;
    const actionColor = isCompleted ? Colors.warning : Colors.success;
    const iconName = isCompleted ? "arrow-undo-outline" : "checkmark-outline";

    return (
      <TouchableOpacity 
        onPress={() => {
          swipeableRef.current?.close();
          isCompleted ? onIncomplete?.(task.id) : onComplete(task.id);
        }} 
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
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
    >
      <View style={[
        styles.container,
        isOverdue && { borderColor: Colors.error, borderLeftWidth: 4, borderLeftColor: Colors.error }
      ]}>
        {/* Toggle Checkbox Box with Priority Colors */}
        <TouchableOpacity 
          onPress={() => task.is_completed ? onIncomplete?.(task.id) : onComplete(task.id)}
          style={[
            styles.customCheckbox,
            { borderColor: task.is_completed ? Colors.success : getPriorityColor(task.priority) },
            task.is_completed && { backgroundColor: Colors.success }
          ]}
        >
          {task.is_completed && (
            <Ionicons name="checkmark" size={12} color="#FFF" />
          )}
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

            {/* Dynamic Metadata Row (Priority, Added Time, Deadline) */}
            <View style={styles.metaRow}>
              {/* Priority Badge */}
              <View style={[
                styles.metaBox, 
                { 
                  borderColor: getPriorityColor(task.priority), 
                  backgroundColor: task.priority === 'high' ? 'rgba(255, 75, 75, 0.08)' : task.priority === 'medium' ? 'rgba(255, 193, 7, 0.08)' : 'rgba(76, 175, 80, 0.08)' 
                }
              ]}>
                <Ionicons name="flag" size={10} color={getPriorityColor(task.priority)} />
                <Text style={[styles.metaText, { color: getPriorityColor(task.priority) }]}>
                  {task.priority.toUpperCase()}
                </Text>
              </View>

              {/* Created At Badge */}
              {task.created_at && (
                <View style={styles.metaBox}>
                  <Ionicons name="add-circle-outline" size={10} color={Colors.muted} />
                  <Text style={styles.metaText}>
                    Added: {new Date(task.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              )}

              {/* Deadline Badge */}
              {task.deadline && (
                <View style={[styles.metaBox, isOverdue && { borderColor: Colors.error, backgroundColor: 'rgba(255, 75, 75, 0.08)' }]}>
                  <Ionicons name="calendar-outline" size={10} color={isOverdue ? Colors.error : Colors.muted} />
                  <Text style={[styles.metaText, isOverdue && { color: Colors.error }]}>
                    Due: {new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              )}
            </View>
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
    paddingVertical: 12,
    paddingLeft: 12,
  },
  customCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    marginRight: 2,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  mainInfo: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
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
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: Colors.surface,
    gap: 4,
  },
  metaText: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.muted,
    fontFamily: 'DM-Sans',
  },
  tag: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'center',
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
    marginVertical: 6,
    borderRadius: 12,
    marginRight: 16,
  },
  completeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginVertical: 6,
    borderRadius: 12,
    marginLeft: 16,
  },
});
