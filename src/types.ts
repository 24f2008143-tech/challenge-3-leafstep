/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  name: string;
  archetype: string;
  baseline_kg_co2_monthly: number;
  state_code?: string;
  answers: {
    transport: string;
    diet: string;
    energy: string;
    shopping: string;
    travel: string;
  };
  top_categories: string[];
}

export interface ActivityLog {
  id: string;
  date: string; // YYYY-MM-DD
  category: "transport" | "diet" | "energy" | "shopping" | "travel";
  activity_name: string;
  quantity: number;
  unit: string;
  kg_co2: number;
  source: "manual" | "nlp" | "ocr";
  raw_input?: string;
}

export interface RecommendedAction {
  id: string;
  category: "transport" | "diet" | "energy" | "shopping" | "travel";
  title: string;
  description: string;
  avg_kg_co2_saved: number;
  difficulty: "Easy" | "Medium" | "Hard";
  why_matters: string;
  completed: boolean;
  completed_at?: string;
}

export interface StreakState {
  current: number;
  best: number;
  last_active_date?: string;
}

export interface ChatMessage {
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface AppState {
  user_id: string;
  onboarded: boolean;
  profile: UserProfile | null;
  logs: ActivityLog[];
  streaks: StreakState;
  recommended_actions: RecommendedAction[];
  chat_messages: ChatMessage[];
  leaf_points?: number;
  rank?: string;
  badges?: string[];
  carbon_iq?: number;
}


