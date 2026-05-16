import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme';
import api from '../../src/api';
import { NewGoalModal } from '../../src/components/NewGoalModal';
import { GoalDetailModal } from '../../src/components/GoalDetailModal';

export default function GoalsScreen() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newModalVisible, setNewModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/goals');
      setGoals(response.data.data);
    } catch (error) {
      console.error('Fetch goals error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleOpenDetail = (id: string) => {
    setSelectedGoalId(id);
    setDetailModalVisible(true);
  };

  const getDaysLeft = (deadline: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(deadline);
    d.setHours(0, 0, 0, 0);
    const diff = d.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days >= 0 ? days : 0;
  };

  const renderItem = ({ item }: { item: any }) => {
    const progress = item.progress_percentage || 0;
    const daysLeft = getDaysLeft(item.deadline);

    return (
      <TouchableOpacity style={styles.goalCard} onPress={() => handleOpenDetail(item.id)}>
        <View style={styles.cardHeader}>
          <Text style={styles.goalDescription} numberOfLines={2}>{item.description}</Text>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryText}>{item.category || 'Goal'}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <Text style={styles.countdownText}>
            <Ionicons name="time-outline" size={14} /> {daysLeft} days left
          </Text>
          <Text style={styles.targetText}>
            {item.current_count} / {item.target_count}
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
        </View>

        {item.today_task && (
          <View style={styles.todayTaskContainer}>
            <Text style={styles.todayTaskLabel}>Today's Target:</Text>
            <Text style={styles.todayTaskValue}>
              {item.today_task.target_count.toFixed(1)} units
              {item.today_task.is_auto_adjusted && (
                <Text style={{ color: Colors.warning, fontSize: 10 }}> (Auto-Adjusted)</Text>
              )}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Goals</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setNewModalVisible(true)}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {loading && goals.length === 0 ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={goals}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="flag-outline" size={64} color={Colors.border} />
              <Text style={styles.emptyText}>No active goals</Text>
            </View>
          }
        />
      )}

      <NewGoalModal
        visible={newModalVisible}
        onClose={() => setNewModalVisible(false)}
        onSave={() => {
          fetchGoals();
        }}
      />

      <GoalDetailModal
        visible={detailModalVisible}
        goalId={selectedGoalId}
        onClose={() => setDetailModalVisible(false)}
        onUpdate={() => fetchGoals()}
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
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  goalCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goalDescription: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'DM Sans',
    color: Colors.text,
    fontWeight: '700',
    marginRight: 12,
  },
  categoryChip: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: 'Syne',
    fontWeight: '700',
    color: Colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  countdownText: {
    fontSize: 12,
    fontFamily: 'DM Sans',
    color: Colors.warning,
    fontWeight: '700',
  },
  targetText: {
    fontSize: 12,
    fontFamily: 'DM Sans',
    color: Colors.muted,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  todayTaskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: 10,
    borderRadius: 8,
  },
  todayTaskLabel: {
    fontSize: 12,
    fontFamily: 'Syne',
    color: Colors.muted,
    fontWeight: '700',
  },
  todayTaskValue: {
    fontSize: 12,
    fontFamily: 'DM Sans',
    color: Colors.primary,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'DM Sans',
    color: Colors.muted,
  },
});
