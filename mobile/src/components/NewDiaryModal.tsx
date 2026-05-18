import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme';
import api from '../api';
import { Audio } from 'expo-av';

interface NewDiaryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (entry: any) => void;
}

const MOODS = [
  { label: 'happy', emoji: '😊' },
  { label: 'excited', emoji: '🤩' },
  { label: 'neutral', emoji: '😐' },
  { label: 'tired', emoji: '😴' },
  { label: 'stressed', emoji: '😰' }
];

export const NewDiaryModal: React.FC<NewDiaryModalProps> = ({ visible, onClose, onSave }) => {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('neutral');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const recordingRef = useRef<Audio.Recording | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  const onStartRecord = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission', 'Microphone permission is required to record audio.');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync({
        isMeteringEnabled: false,
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 64000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.LOW,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 64000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 64000,
        },
      });
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (err) {
      console.warn(err);
      setIsRecording(false);
    }
  };

  const onStopRecord = async () => {
    if (!recordingRef.current) return;
    try {
      setIsRecording(false);
      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      if (uri) handleTranscribe(uri);
    } catch (err) {
      console.warn(err);
      setIsRecording(false);
    }
  };

  const handleTranscribe = async (audioUri: string) => {
    setIsTranscribing(true);
    try {
      // Need to create FormData to send file
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? audioUri : audioUri.replace('file://', ''),
        type: 'audio/m4a',
        name: 'diary_audio.m4a',
      } as any);

      const response = await api.post('/diary/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.data?.text) {
        setContent(prev => prev + (prev ? ' ' : '') + response.data.data.text);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', "Couldn't transcribe audio. Please type instead.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Validation', 'Diary content cannot be empty.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.post('/diary', { content, mood, tags });
      onSave(response.data.data.entry);
      setContent('');
      setMood('neutral');
      setTags([]);
      onClose();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save diary entry.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>New Entry</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.moodRow}>
            {MOODS.map(m => (
              <TouchableOpacity 
                key={m.label}
                style={[styles.moodBtn, mood === m.label && styles.moodBtnActive]}
                onPress={() => setMood(m.label)}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.textInput}
            multiline
            placeholder="How are you feeling today?"
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />

          <View style={styles.tagInputContainer}>
            <Ionicons name="pricetag-outline" size={20} color={Colors.muted} />
            <TextInput
              style={styles.tagInput}
              placeholder="Add tags (press Enter or space)"
              value={tagInput}
              onChangeText={(text) => {
                if (text.endsWith(' ') || text.endsWith(',')) {
                  const newTag = text.replace(/[, ]/g, '').trim().toLowerCase();
                  if (newTag && !tags.includes(newTag)) setTags([...tags, newTag]);
                  setTagInput('');
                } else {
                  setTagInput(text);
                }
              }}
              onSubmitEditing={() => {
                const newTag = tagInput.trim().toLowerCase();
                if (newTag && !tags.includes(newTag)) setTags([...tags, newTag]);
                setTagInput('');
              }}
            />
          </View>
          {tags.length > 0 && (
            <View style={styles.tagChipsRow}>
              {tags.map(tag => (
                <TouchableOpacity key={tag} style={styles.tagChip} onPress={() => setTags(tags.filter(t => t !== tag))}>
                  <Text style={styles.tagChipText}>#{tag}</Text>
                  <Ionicons name="close-circle" size={14} color={Colors.primary} style={{marginLeft: 4}}/>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={[styles.micBtn, isRecording && styles.micBtnRecording]}
              onPressIn={onStartRecord}
              onPressOut={onStopRecord}
              disabled={isTranscribing}
            >
              {isTranscribing ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Ionicons name="mic" size={24} color="#FFF" />
              )}
            </TouchableOpacity>
            <Text style={styles.micHint}>
              {isTranscribing ? 'Transcribing...' : isRecording ? 'Recording... Release to stop' : 'Hold to speak'}
            </Text>

            <TouchableOpacity 
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={isSaving || isTranscribing}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    height: '80%',
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
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  moodBtn: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  moodBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
  },
  moodEmoji: {
    fontSize: 24,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontFamily: 'DM Sans',
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: 'DM Sans',
    color: Colors.text,
    fontSize: 14,
  },
  tagChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  tagChipText: {
    color: Colors.primary,
    fontFamily: 'Syne',
    fontSize: 12,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  micBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micBtnRecording: {
    backgroundColor: Colors.error,
    transform: [{ scale: 1.1 }],
  },
  micHint: {
    marginLeft: 16,
    flex: 1,
    color: Colors.muted,
    fontFamily: 'DM Sans',
    fontSize: 12,
  },
  saveBtn: {
    backgroundColor: Colors.success,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontFamily: 'Syne',
    fontSize: 16,
  },
});
