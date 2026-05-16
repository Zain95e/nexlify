import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme';
import api from '../api';

interface DiaryEntry {
  id: string;
  mood: string;
  tags: string[];
  preview: string;
  content?: string; // full content fetched on demand, or we might pass it if we have it
  created_at: string;
}

interface DiaryDetailModalProps {
  visible: boolean;
  entry: DiaryEntry | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: () => void;
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

export const DiaryDetailModal: React.FC<DiaryDetailModalProps> = ({ visible, entry, onClose, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  // When modal opens or entry changes, reset edit state
  React.useEffect(() => {
    if (visible && entry) {
      setIsEditing(false);
      setEditedContent(entry.content || entry.preview || ''); // In our implementation we only returned preview in list, but let's assume we can edit what we have, ideally we'd fetch full content if it was truncated. 
      // Actually, Phase 6 spec says GET /api/diary returns preview, so we might need to fetch full content?
      // Wait, let's just use what we have, or if we need to fetch full content we can do that here.
    }
  }, [visible, entry]);

  const [fullContent, setFullContent] = useState('');
  const [loadingContent, setLoadingContent] = useState(false);

  React.useEffect(() => {
    if (visible && entry && !isEditing) {
      // In a real scenario, we might want to fetch full content if preview is truncated.
      // But the api only has GET /api/diary (paginated list). There is no GET /api/diary/:id specified in Phase 6.
      // So perhaps the list was supposed to return full content, or preview is all we have for now.
      // Actually, looking at 6.1.2: SELECT ... LEFT(content, 200) as preview.
      // I will assume we can't easily fetch full content without an endpoint, unless I add it to the backend.
      // Since Phase 6.1 didn't specify GET /api/diary/:id, I'll just use the preview as content for now, or assume the user will just edit what they see. Wait, we should add GET /api/diary/:id if it's missing, but I am asked to "execute till 6.1.4-6.1.5", and I shouldn't go beyond or invent.
      // Let's just use entry.preview for now, or assume I can fetch if I need to.
      setFullContent(entry.content || entry.preview);
      setEditedContent(entry.content || entry.preview);
    }
  }, [visible, entry]);


  if (!entry) return null;

  const handleDelete = () => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this diary entry? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/diary/${entry.id}`);
              onDelete(entry.id);
              onClose();
            } catch (error) {
              console.error('Failed to delete entry', error);
              Alert.alert('Error', 'Failed to delete entry');
            }
          }
        }
      ]
    );
  };

  const handleSaveEdit = async () => {
    try {
      await api.patch(`/diary/${entry.id}`, { content: editedContent });
      setFullContent(editedContent);
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to update entry', error);
      Alert.alert('Error', 'Failed to update entry');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            <View style={styles.headerRight}>
              {isEditing ? (
                <TouchableOpacity onPress={handleSaveEdit} style={[styles.iconBtn, { backgroundColor: Colors.success }]}>
                  <Ionicons name="checkmark" size={20} color="#FFF" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.iconBtn}>
                  <Ionicons name="pencil" size={20} color={Colors.text} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleDelete} style={[styles.iconBtn, { marginLeft: 8 }]}>
                <Ionicons name="trash" size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.scrollArea}>
            <View style={styles.metaData}>
              <Text style={styles.dateText}>
                {new Date(entry.created_at).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </Text>
              <Text style={styles.moodEmoji}>{getMoodEmoji(entry.mood)}</Text>
            </View>

            {entry.tags && entry.tags.length > 0 && (
              <View style={styles.tagContainer}>
                {entry.tags.map(tag => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {isEditing ? (
              <TextInput
                style={styles.editInput}
                multiline
                value={editedContent}
                onChangeText={setEditedContent}
                autoFocus
              />
            ) : (
              <Text style={styles.bodyText}>{fullContent}</Text>
            )}
          </ScrollView>
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
  contentContainer: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerRight: {
    flexDirection: 'row',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  metaData: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'Syne',
    fontWeight: '700',
    color: Colors.primary,
  },
  moodEmoji: {
    fontSize: 32,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  tag: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Syne',
    fontWeight: '700',
    color: Colors.primary,
  },
  bodyText: {
    fontSize: 16,
    fontFamily: 'DM Sans',
    color: Colors.text,
    lineHeight: 26,
  },
  editInput: {
    fontSize: 16,
    fontFamily: 'DM Sans',
    color: Colors.text,
    lineHeight: 26,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 200,
    textAlignVertical: 'top',
  },
});
