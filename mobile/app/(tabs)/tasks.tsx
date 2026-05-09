import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, SafeAreaView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../../src/theme';
import { TaskItem } from '../../src/components/TaskItem';
import { AddTaskModal } from '../../src/components/AddTaskModal';
import api from '../../src/api';
import { setTasks, addTask, deleteTask, updateTask, setLoading } from '../../src/store/slices/taskSlice';
import { RootState } from '../../src/store';

export default function TasksScreen() {
  const dispatch = useDispatch();
  const { tasks, loading } = useSelector((state: RootState) => state.tasks);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = async () => {
    dispatch(setLoading(true));
    try {
      const response = await api.get(`/tasks?status=${activeTab}`);
      const fetchedTasks = response.data.data;
      
      // Sort: Overdue first, then by deadline
      const sorted = [...fetchedTasks].sort((a, b) => {
        if (activeTab === 'completed') return 0; // Don't sort completed
        
        const isAOverdue = a.deadline && new Date(a.deadline) < new Date();
        const isBOverdue = b.deadline && new Date(b.deadline) < new Date();
        
        if (isAOverdue && !isBOverdue) return -1;
        if (!isAOverdue && isBOverdue) return 1;
        
        // Both overdue or both not overdue, sort by deadline
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });

      dispatch(setTasks(sorted));
    } catch (error) {
      console.error('Fetch tasks error:', error);
    } finally {
      dispatch(setLoading(false));
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [activeTab]);

  const handleCreateTask = async (taskData: any) => {
    try {
      const response = await api.post('/tasks', taskData);
      if (activeTab === 'pending') {
        dispatch(addTask(response.data.data));
      }
    } catch (error) {
      console.error('Create task error:', error);
    }
  };

  const handleCompleteTask = async (id: string) => {
    try {
      await api.patch(`/tasks/${id}/complete`);
      // Since it's completed, remove from pending list
      dispatch(deleteTask(id));
    } catch (error) {
      console.error('Complete task error:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`);
      dispatch(deleteTask(id));
    } catch (error) {
      console.error('Delete task error:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Tasks</Text>
          <Text style={styles.subtitle}>You have {tasks.length} {activeTab} tasks</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>Done</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loader}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem 
              task={item} 
              onComplete={handleCompleteTask}
              onDelete={handleDeleteTask}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={64} color={Colors.border} />
              <Text style={styles.emptyText}>No {activeTab} tasks found</Text>
            </View>
          }
        />
      )}

      <AddTaskModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreateTask}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'Syne',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.muted,
    fontFamily: 'DM Sans',
    marginTop: 4,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.muted,
    fontFamily: 'DM Sans',
  },
  activeTabText: {
    color: Colors.text,
  },
  listContent: {
    paddingBottom: 100,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.muted,
    fontFamily: 'DM Sans',
    marginTop: 16,
  },
});
