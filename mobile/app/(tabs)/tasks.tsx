import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme';
import { TaskItem } from '../../src/components/TaskItem';
import { AddTaskModal } from '../../src/components/AddTaskModal';
import api from '../../src/api';
import { setTasks, addTask, deleteTask } from '../../src/store/slices/taskSlice';
import { RootState } from '../../src/store';

export default function TasksScreen() {
  const dispatch = useDispatch();
  const { tasks, loading } = useSelector((state: RootState) => state.tasks);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Local date filter state variables
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'week' | 'month' | 'custom'>('all');
  const [customRange, setCustomRange] = useState<{ start: Date; end: Date } | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);

  const fetchTasks = async () => {
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
      dispatch(deleteTask(id));
    } catch (error) {
      console.error('Complete task error:', error);
    }
  };

  const handleIncompleteTask = async (id: string) => {
    try {
      await api.patch(`/tasks/${id}/incomplete`);
      dispatch(deleteTask(id));
    } catch (error) {
      console.error('Incomplete task error:', error);
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

  const handleFilterSelect = (filter: 'all' | 'today' | 'tomorrow' | 'week' | 'month' | 'custom') => {
    if (filter === 'custom') {
      setShowStartPicker(true);
    } else {
      setDateFilter(filter);
    }
  };

  const onStartChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      // Start date starts at 00:00:00 of selected day
      const start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0);
      setTempStartDate(start);
      setShowEndPicker(true);
    }
  };

  const onEndChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate && tempStartDate) {
      // End date goes to 23:59:59 of selected day
      const end = new Date(selectedDate);
      end.setHours(23, 59, 59, 999);
      setCustomRange({
        start: tempStartDate,
        end: end
      });
      setDateFilter('custom');
    }
  };

  const clearCustomRange = (e: any) => {
    e.stopPropagation();
    setCustomRange(null);
    setDateFilter('all');
  };

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getFilteredTasks = () => {
    const now = new Date();
    
    // local bounds for filtering
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const tomStart = new Date(todayStart);
    tomStart.setDate(todayStart.getDate() + 1);
    const tomEnd = new Date(todayEnd);
    tomEnd.setDate(todayEnd.getDate() + 1);

    const weekEnd = new Date(todayEnd);
    weekEnd.setDate(todayEnd.getDate() + 7);

    const monthEnd = new Date(todayEnd);
    monthEnd.setMonth(todayEnd.getMonth() + 1);

    return tasks.filter((task) => {
      if (dateFilter === 'all') return true;
      if (!task.deadline) return false;

      const taskDate = new Date(task.deadline);

      if (dateFilter === 'today') {
        return taskDate >= todayStart && taskDate <= todayEnd;
      }
      if (dateFilter === 'tomorrow') {
        return taskDate >= tomStart && taskDate <= tomEnd;
      }
      if (dateFilter === 'week') {
        return taskDate >= todayStart && taskDate <= weekEnd;
      }
      if (dateFilter === 'month') {
        return taskDate >= todayStart && taskDate <= monthEnd;
      }
      if (dateFilter === 'custom' && customRange) {
        return taskDate >= customRange.start && taskDate <= customRange.end;
      }
      return true;
    });
  };

  const filteredTasks = getFilteredTasks();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Tasks</Text>
          <Text style={styles.subtitle}>You have {filteredTasks.length} {activeTab} tasks</Text>
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

      {/* Date Filter Bar */}
      <View style={styles.filterBarWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterBar}
          contentContainerStyle={styles.filterBarContent}
        >
          {[
            { key: 'all', label: 'All' },
            { key: 'today', label: 'Today' },
            { key: 'tomorrow', label: 'Tomorrow' },
            { key: 'week', label: 'This Week' },
            { key: 'month', label: 'This Month' },
            { key: 'custom', label: customRange ? `${formatShortDate(customRange.start)} - ${formatShortDate(customRange.end)}` : 'Custom Date' }
          ].map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => handleFilterSelect(f.key as any)}
              style={[
                styles.filterPill,
                dateFilter === f.key && styles.activeFilterPill
              ]}
            >
              <Text style={[
                styles.filterPillText,
                dateFilter === f.key && styles.activeFilterPillText
              ]}>
                {f.label}
              </Text>
              {f.key === 'custom' && customRange && (
                <TouchableOpacity onPress={clearCustomRange} style={{ marginLeft: 6 }}>
                  <Ionicons name="close-circle" size={14} color={dateFilter === 'custom' ? '#FFF' : Colors.muted} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loader}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem 
              task={item} 
              onComplete={handleCompleteTask}
              onIncomplete={handleIncompleteTask}
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

      {showStartPicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={onStartChange}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={tempStartDate || new Date()}
          mode="date"
          display="default"
          minimumDate={tempStartDate || undefined}
          onChange={onEndChange}
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
    paddingBottom: 16,
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
    fontFamily: 'DM-Sans',
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
    fontFamily: 'DM-Sans',
  },
  activeTabText: {
    color: Colors.text,
  },
  filterBarWrapper: {
    height: 44,
    marginBottom: 12,
  },
  filterBar: {
    flex: 1,
  },
  filterBarContent: {
    paddingHorizontal: 24,
    gap: 8,
    alignItems: 'center',
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  activeFilterPill: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.muted,
    fontFamily: 'DM-Sans',
  },
  activeFilterPillText: {
    color: '#FFF',
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
    fontFamily: 'DM-Sans',
    marginTop: 16,
  },
});
