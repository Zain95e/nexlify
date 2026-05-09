import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Goal {
  id: string;
  title: string;
  target_value: number;
  current_value: number;
  deadline: string;
}

interface GoalState {
  goals: Goal[];
  loading: boolean;
  error: string | null;
}

const initialState: GoalState = {
  goals: [],
  loading: false,
  error: null,
};

const goalSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    setGoals: (state, action: PayloadAction<Goal[]>) => {
      state.goals = action.payload;
    },
    updateGoalProgress: (state, action: PayloadAction<{ id: string; value: number }>) => {
      const goal = state.goals.find(g => g.id === action.payload.id);
      if (goal) {
        goal.current_value = action.payload.value;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setGoals, updateGoalProgress, setLoading } = goalSlice.actions;
export default goalSlice.reducer;
