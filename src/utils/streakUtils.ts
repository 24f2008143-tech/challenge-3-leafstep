export interface StreakState {
  current: number;
  best: number;
  last_active_date?: string;
}

export function updateStreak(state: { streaks: StreakState }): void {
  const todayStr = new Date().toISOString().split("T")[0];
  const lastActiveStr = state.streaks.last_active_date;

  if (!lastActiveStr) {
    state.streaks.current = 1;
    state.streaks.last_active_date = todayStr;
    return;
  }

  if (lastActiveStr === todayStr) {
    return; // already active today, streak safe
  }

  const lastDate = new Date(lastActiveStr);
  const todayDate = new Date(todayStr);
  
  // Set both times to midnight to calculate difference in full days
  lastDate.setHours(0, 0, 0, 0);
  todayDate.setHours(0, 0, 0, 0);

  const diffMs = Math.abs(todayDate.getTime() - lastDate.getTime());
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    state.streaks.current += 1;
    if (state.streaks.current > state.streaks.best) {
      state.streaks.best = state.streaks.current;
    }
  } else if (diffDays > 1) {
    state.streaks.current = 1;
  }

  state.streaks.last_active_date = todayStr;
}
