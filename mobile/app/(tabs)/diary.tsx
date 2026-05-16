import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme';
import api from '../../src/api';
import { NewDiaryModal } from '../../src/components/NewDiaryModal';
import { DiaryDetailModal } from '../../src/components/DiaryDetailModal';
import { Calendar } from 'react-native-calendars';

interface DiaryEntry {
  id: string;
  mood: string;
  tags: string[];
  preview: string;
  created_at: string;
}

const getMoodEmoji = (mood: string) => {
  switch (mood) {
    case 'happy': return '😊';
    case 'excited': return '🤩';
    case 'tired': return '😴';
    case 'stressed': return '😰';
    default: return '😐';
  }
};

export default function DiaryScreen() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  
  const fetchEntries = useCallback(async (query: string = '') => {
    setLoading(true);
    try {
      const endpoint = query ? `/diary/search?q=${encodeURIComponent(query)}` : '/diary';
      const response = await api.get(endpoint);
      setEntries(response.data.data);
    } catch (error) {
      console.error('Fetch diary error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchEntries(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchEntries]);

  const handleSaveEntry = (newEntry: DiaryEntry) => {
    fetchEntries();
  };

  const handleEntryPress = (entry: DiaryEntry) => {
    setSelectedEntry(entry);
    setDetailVisible(true);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const handleUpdateEntry = () => {
    fetchEntries();
  };

  const markedDates = React.useMemo(() => {
    const marks: any = {};
    entries.forEach(entry => {
      const dateString = new Date(entry.created_at).toISOString().split('T')[0];
      let color = Colors.primary;
      switch(entry.mood) {
        case 'happy': color = Colors.success; break;
        case 'excited': color = '#FFB347'; break; // Using warning/orange for excited
        case 'stressed': color = Colors.error; break;
        case 'tired': color = Colors.muted; break;
      }
      marks[dateString] = { marked: true, dotColor: color };
    });
    return marks;
  }, [entries]);

  const renderItem = ({ item }: { item: DiaryEntry }) => (
    <TouchableOpacity style={styles.entryCard} onPress={() => handleEntryPress(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.dateText}>
          {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>
        <Text style={styles.emojiText}>{getMoodEmoji(item.mood)}</Text>
      </View>
      <Text style={styles.previewText} numberOfLines={2}>
        {item.preview}
      </Text>
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagContainer}>
          {item.tags.map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Diary</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your thoughts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.muted}
        />
      </View>

      {!searchQuery && (
        <View style={styles.calendarContainer}>
          <Calendar
            theme={{
              backgroundColor: Colors.background,
              calendarBackground: Colors.surface,
              textSectionTitleColor: Colors.muted,
              selectedDayBackgroundColor: Colors.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: Colors.primary,
              dayTextColor: Colors.text,
              textDisabledColor: Colors.border,
              dotColor: Colors.primary,
              selectedDotColor: '#ffffff',
              arrowColor: Colors.primary,
              monthTextColor: Colors.text,
              indicatorColor: Colors.primary,
              textDayFontFamily: 'DM Sans',
              textMonthFontFamily: 'Syne',
              textDayHeaderFontFamily: 'Syne',
              textMonthFontWeight: 'bold',
            }}
            markedDates={markedDates}
          />
        </View>
      )}

      {loading && entries.length === 0 ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={64} color={Colors.border} />
              <Text style={styles.emptyText}>No entries found</Text>
            </View>
          }
        />
      )}

      <NewDiaryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveEntry}
      />

      <DiaryDetailModal
        visible={detailVisible}
        entry={selectedEntry}
        onClose={() => setDetailVisible(false)}
        onDelete={handleDeleteEntry}
        onUpdate={handleUpdateEntry}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 24,
    marginBottom: 24,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'DM Sans',
    fontSize: 14,
    color: Colors.text,
  },
  calendarContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  entryCard: {
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
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'DM Sans',
    color: Colors.primary,
    fontWeight: '700',
  },
  emojiText: {
    fontSize: 20,
  },
  previewText: {
    fontSize: 14,
    fontFamily: 'DM Sans',
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  tagText: {
    fontSize: 10,
    fontFamily: 'Syne',
    fontWeight: '700',
    color: Colors.primary,
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
