import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../theme';
import { Input } from './Input';
import { Button } from './Button';
import { Ionicons } from '@expo/vector-icons';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (task: any) => void;
  isLoading?: boolean;
}

const PRIORITIES = ['low', 'medium', 'high'];

const parseNaturalLanguageDate = (text: string): { cleanText: string; date?: Date; matchedPhrase?: string } => {
  const lower = text.toLowerCase();
  const now = new Date();
  let parsedDate: Date | undefined = undefined;
  let matchedPhrase = '';

  // 1. Check "tomorrow" or "tom"
  const tomorrowRegex = /\b(tomorrow|tom)\b/i;
  // 2. Check "today"
  const todayRegex = /\b(today)\b/i;
  // 3. Check Date format like "13 june" or "june 13"
  const dateRegex = /\b(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\b/i;
  const dateRegexReverse = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})\b/i;

  // 4. Weekdays Regex (handling mon, mond, monda, monday, etc. for all days)
  const weekdayRegex = /\b(monday|monda|mond|mon|tuesday|tuesda|tuesd|tues|tue|wednesday|wednesda|wednesd|wednes|wedne|wedn|wed|thursday|thursda|thursd|thurs|thur|thu|friday|frida|frid|fri|saturday|saturda|saturd|satur|satu|sat|sunday|sunda|sund|sun)\b/i;

  if (tomorrowRegex.test(lower)) {
    const match = text.match(tomorrowRegex);
    matchedPhrase = match ? match[0] : '';
    parsedDate = new Date(now);
    parsedDate.setDate(now.getDate() + 1);
    parsedDate.setHours(23, 59, 59, 999);
  } else if (todayRegex.test(lower)) {
    const match = text.match(todayRegex);
    matchedPhrase = match ? match[0] : '';
    parsedDate = new Date(now);
    parsedDate.setHours(23, 59, 59, 999);
  } else if (weekdayRegex.test(lower)) {
    const match = text.match(weekdayRegex);
    if (match) {
      matchedPhrase = match[0];
      const textPhrase = matchedPhrase.toLowerCase();
      
      let targetDayIdx = -1;
      if (/^mon/i.test(textPhrase)) targetDayIdx = 1;
      else if (/^tue/i.test(textPhrase)) targetDayIdx = 2;
      else if (/^wed/i.test(textPhrase)) targetDayIdx = 3;
      else if (/^thu/i.test(textPhrase)) targetDayIdx = 4;
      else if (/^fri/i.test(textPhrase)) targetDayIdx = 5;
      else if (/^sat/i.test(textPhrase)) targetDayIdx = 6;
      else if (/^sun/i.test(textPhrase)) targetDayIdx = 0;

      if (targetDayIdx !== -1) {
        parsedDate = new Date(now);
        const currentDayIdx = now.getDay();
        // Calculate days difference to the NEXT target day index in future
        const daysUntil = (targetDayIdx - currentDayIdx + 7) % 7 || 7;
        parsedDate.setDate(now.getDate() + daysUntil);
        parsedDate.setHours(23, 59, 59, 999);
      }
    }
  } else if (dateRegex.test(lower)) {
    const match = text.match(dateRegex);
    if (match) {
      matchedPhrase = match[0];
      const day = parseInt(match[1]);
      const monthStr = match[2].toLowerCase();
      const months: { [key: string]: number } = {
        january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2, april: 3, apr: 3,
        may: 4, june: 5, jun: 5, july: 6, jul: 6, august: 7, aug: 7, september: 8, sep: 8,
        october: 9, oct: 9, november: 10, nov: 10, december: 11, dec: 11
      };
      const month = months[monthStr];
      if (month !== undefined) {
        parsedDate = new Date(now.getFullYear(), month, day, 23, 59, 59, 999);
        if (parsedDate < now) {
          parsedDate.setFullYear(now.getFullYear() + 1);
        }
      }
    }
  } else if (dateRegexReverse.test(lower)) {
    const match = text.match(dateRegexReverse);
    if (match) {
      matchedPhrase = match[0];
      const monthStr = match[1].toLowerCase();
      const day = parseInt(match[2]);
      const months: { [key: string]: number } = {
        january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2, april: 3, apr: 3,
        may: 4, june: 5, jun: 5, july: 6, jul: 6, august: 7, aug: 7, september: 8, sep: 8,
        october: 9, oct: 9, november: 10, nov: 10, december: 11, dec: 11
      };
      const month = months[monthStr];
      if (month !== undefined) {
        parsedDate = new Date(now.getFullYear(), month, day, 23, 59, 59, 999);
        if (parsedDate < now) {
          parsedDate.setFullYear(now.getFullYear() + 1);
        }
      }
    }
  }

  if (parsedDate && matchedPhrase) {
    // Escape special characters in matchedPhrase to avoid regex failures
    const escapedPhrase = matchedPhrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedPhrase}\\b`, 'gi');
    const cleanText = text.replace(regex, '').replace(/\s+/g, ' ').trim();
    return { cleanText, date: parsedDate, matchedPhrase };
  }

  return { cleanText: text };
};

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ visible, onClose, onSubmit, isLoading }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('Dev');
  const [categories, setCategories] = useState(['Dev', 'Work', 'Life', 'Study', 'Fitness']);
  const [newCatInput, setNewCatInput] = useState('');
  const [showCatInput, setShowCatInput] = useState(false);
  
  // Default deadline: today at 11:59 PM
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setHours(23, 59, 0, 0);
    return d;
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [parsedDateBadge, setParsedDateBadge] = useState<string | null>(null);

  const handleTitleChange = (text: string) => {
    setTitle(text);
    const parsed = parseNaturalLanguageDate(text);
    if (parsed.date && parsed.matchedPhrase) {
      setDeadline(parsed.date);
      
      const lowerPhrase = parsed.matchedPhrase.toLowerCase();
      if (/\b(tomorrow|tom)\b/i.test(lowerPhrase)) {
        setParsedDateBadge('Tomorrow (11:59 PM)');
      } else if (/\b(today)\b/i.test(lowerPhrase)) {
        setParsedDateBadge('Today (11:59 PM)');
      } else if (
        /\b(monday|monda|mond|mon|tuesday|tuesda|tuesd|tues|tue|wednesday|wednesda|wednesd|wednes|wedne|wedn|wed|thursday|thursda|thursd|thurs|thur|thu|friday|frida|frid|fri|saturday|saturda|saturd|satur|satu|sat|sunday|sunda|sund|sun)\b/i.test(lowerPhrase)
      ) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = days[parsed.date.getDay()];
        setParsedDateBadge(`${dayName} (11:59 PM)`);
      } else {
        setParsedDateBadge(`${parsed.date.toLocaleDateString([], { month: 'short', day: 'numeric' })} (11:59 PM)`);
      }
    } else {
      setParsedDateBadge(null);
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(deadline);
      newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setDeadline(newDate);
      setParsedDateBadge(null);
    }
  };

  const onChangeTime = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const newDate = new Date(deadline);
      newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      setDeadline(newDate);
      setParsedDateBadge(null);
    }
  };

  const handleAddCategory = () => {
    const clean = newCatInput.trim();
    if (clean && !categories.includes(clean)) {
      setCategories([...categories, clean]);
      setCategory(clean);
      setNewCatInput('');
      setShowCatInput(false);
    }
  };

  const handleSubmit = () => {
    if (!title) return;
    
    const parsed = parseNaturalLanguageDate(title);
    const finalTitle = parsed.date ? parsed.cleanText : title;
    const finalDeadline = parsed.date ? parsed.date : deadline;

    onSubmit({ 
      title: finalTitle, 
      description, 
      priority, 
      category, 
      deadline: finalDeadline.toISOString() 
    });
    
    // Reset Form
    setTitle('');
    setDescription('');
    const defaultD = new Date();
    defaultD.setHours(23, 59, 0, 0);
    setDeadline(defaultD);
    setParsedDateBadge(null);
    onClose();
  };

  // Render Title input with parsed date keyword highlighted in-place!
  const renderHighlightedText = (fullText: string) => {
    if (!fullText) {
      return <Text style={styles.placeholderStyle}>What needs to be done?</Text>;
    }

    const parsed = parseNaturalLanguageDate(fullText);
    if (parsed.matchedPhrase) {
      // Split by matched word case-insensitively
      const escapedPhrase = parsed.matchedPhrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(${escapedPhrase})`, 'gi');
      const parts = fullText.split(regex);
      return (
        <Text style={styles.richText} numberOfLines={1}>
          {parts.map((part, index) => {
            const isMatch = part.toLowerCase() === parsed.matchedPhrase!.toLowerCase();
            return (
              <Text 
                key={index} 
                style={isMatch ? styles.highlightedWord : styles.normalWord}
              >
                {part}
              </Text>
            );
          })}
        </Text>
      );
    }

    return <Text style={styles.richText} numberOfLines={1}>{fullText}</Text>;
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
                  <Text style={styles.headerTitle}>New Task</Text>
                  <TouchableOpacity onPress={onClose}>
                    <Ionicons name="close" size={24} color={Colors.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView 
                  style={styles.form}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Smart Highlighted Title Input Area */}
                  <View style={styles.smartInputContainer}>
                    <Text style={styles.smartInputLabel}>Task Title</Text>
                    <View style={styles.smartInputWrapper}>
                      {/* Highlighted Visual Text Layer Behind */}
                      <View style={styles.visualTextContainer} pointerEvents="none">
                        {renderHighlightedText(title)}
                      </View>
                      
                      {/* Input is placed on top. Transparent color when typing, so user sees highlighted visual text below */}
                      <TextInput
                        style={[
                          styles.smartTextInput,
                          title ? { color: 'transparent' } : { color: Colors.text }
                        ]}
                        placeholder="What needs to be done?"
                        placeholderTextColor={Colors.muted}
                        value={title}
                        onChangeText={handleTitleChange}
                        selectionColor={Colors.primary}
                        autoFocus
                      />
                    </View>
                  </View>

                  {parsedDateBadge && (
                    <View style={styles.parsedBadge}>
                      <Ionicons name="sparkles" size={12} color={Colors.tertiary} />
                      <Text style={styles.parsedBadgeText}>Smart Date: {parsedDateBadge}</Text>
                    </View>
                  )}

                  <Input
                    label="Description (Optional)"
                    placeholder="Add some details..."
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={3}
                    containerStyle={{ height: 80 }}
                  />

                  <Text style={styles.label}>Deadline</Text>
                  <View style={styles.dateTimeContainer}>
                    <TouchableOpacity style={styles.dateTimeBtn} onPress={() => setShowDatePicker(true)}>
                      <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
                      <Text style={styles.dateTimeText}>{deadline.toLocaleDateString()}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dateTimeBtn} onPress={() => setShowTimePicker(true)}>
                      <Ionicons name="time-outline" size={18} color={Colors.primary} />
                      <Text style={styles.dateTimeText}>
                        {deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {showDatePicker && (
                    <DateTimePicker
                      value={deadline}
                      mode="date"
                      display="default"
                      onChange={onChangeDate}
                    />
                  )}
                  {showTimePicker && (
                    <DateTimePicker
                      value={deadline}
                      mode="time"
                      display="default"
                      onChange={onChangeTime}
                    />
                  )}

                  <Text style={styles.label}>Priority</Text>
                  <View style={styles.optionsRow}>
                    {PRIORITIES.map((p) => (
                      <TouchableOpacity
                        key={p}
                        onPress={() => setPriority(p)}
                        style={[
                          styles.option,
                          priority === p && { backgroundColor: Colors.primary, borderColor: Colors.primary },
                        ]}
                      >
                        <Text style={[styles.optionText, priority === p && { color: '#FFF' }]}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.label}>Category</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    style={styles.categoryRow}
                    contentContainerStyle={styles.categoryRowContent}
                  >
                    {categories.map((c) => (
                      <TouchableOpacity
                        key={c}
                        onPress={() => setCategory(c)}
                        style={[
                          styles.tag,
                          category === c && { backgroundColor: Colors.tertiary, borderColor: Colors.tertiary },
                        ]}
                      >
                        <Text style={[styles.tagText, category === c && { color: '#FFF' }]}>{c}</Text>
                      </TouchableOpacity>
                    ))}

                    {!showCatInput ? (
                      <TouchableOpacity
                        onPress={() => setShowCatInput(true)}
                        style={[styles.tag, { borderStyle: 'dashed', borderColor: Colors.primary }]}
                      >
                        <Text style={[styles.tagText, { color: Colors.primary }]}>+ Custom</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.customCatInputContainer}>
                        <TextInput
                          placeholder="New Category..."
                          placeholderTextColor={Colors.muted}
                          value={newCatInput}
                          onChangeText={setNewCatInput}
                          style={styles.customCatTextInput}
                          autoFocus
                          onSubmitEditing={handleAddCategory}
                        />
                        <TouchableOpacity onPress={handleAddCategory} style={styles.customCatBtn}>
                          <Ionicons name="checkmark" size={14} color={Colors.success} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowCatInput(false)} style={styles.customCatBtn}>
                          <Ionicons name="close" size={14} color={Colors.error} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </ScrollView>
                </ScrollView>

                <View style={styles.footer}>
                  <Button title="Create Task" onPress={handleSubmit} loading={isLoading} />
                </View>
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
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Syne',
    color: Colors.text,
  },
  form: {
    marginBottom: 16,
  },
  smartInputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  smartInputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.muted,
    marginBottom: 6,
    fontFamily: 'Syne',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  smartInputWrapper: {
    height: 52,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    position: 'relative',
    justifyContent: 'center',
  },
  smartTextInput: {
    fontSize: 16,
    fontFamily: 'DM-Sans',
    height: '100%',
    width: '100%',
    padding: 0,
    margin: 0,
  },
  visualTextContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  placeholderStyle: {
    fontSize: 16,
    fontFamily: 'DM-Sans',
    color: Colors.muted,
  },
  richText: {
    fontSize: 16,
    fontFamily: 'DM-Sans',
    color: Colors.text,
  },
  normalWord: {
    color: Colors.text,
  },
  highlightedWord: {
    color: Colors.primary,
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
    fontWeight: '700',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  parsedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 99, 255, 0.12)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
    marginTop: -8,
    marginBottom: 16,
  },
  parsedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    fontFamily: 'Syne',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.muted,
    marginBottom: 12,
    fontFamily: 'Syne',
    textTransform: 'uppercase',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  dateTimeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  dateTimeText: {
    color: Colors.text,
    fontFamily: 'DM-Sans',
    fontSize: 14,
    fontWeight: '500',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  option: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.muted,
    fontFamily: 'DM-Sans',
  },
  categoryRow: {
    marginBottom: 16,
  },
  categoryRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.muted,
    fontFamily: 'Syne',
  },
  customCatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 16,
  },
  customCatTextInput: {
    width: 110,
    height: 34,
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 12,
    color: Colors.text,
    fontFamily: 'DM-Sans',
  },
  customCatBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    marginBottom: Platform.OS === 'ios' ? 24 : 8,
  },
});
