import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DiaryEntry {
  id: string;
  content: string;
  mood: string;
  sentiment_score?: number;
  created_at: string;
}

interface DiaryState {
  entries: DiaryEntry[];
  loading: boolean;
  error: string | null;
}

const initialState: DiaryState = {
  entries: [],
  loading: false,
  error: null,
};

const diarySlice = createSlice({
  name: 'diary',
  initialState,
  reducers: {
    setEntries: (state, action: PayloadAction<DiaryEntry[]>) => {
      state.entries = action.payload;
    },
    addEntry: (state, action: PayloadAction<DiaryEntry>) => {
      state.entries.unshift(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setEntries, addEntry, setLoading } = diarySlice.actions;
export default diarySlice.reducer;
