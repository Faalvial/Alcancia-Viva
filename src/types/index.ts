export type TransactionType = 'expense' | 'income' | 'savings';
export type InputSource = 'voice' | 'text' | 'manual';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: TransactionType;
  source: InputSource;
  pendingSync?: boolean;
}

export interface Goal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category: string;
  status: 'in_progress' | 'achieved';
  weekly_target: number;
}

export interface GroupMember {
  id: string;
  name: string;
  contribution: number;
}

export interface GroupContribution {
  id: string;
  member_name: string;
  amount: number;
  date: string;
  note?: string;
}

export interface CollaborativeGroup {
  id: string;
  name: string;
  invite_code: string;
  target_amount: number;
  current_amount: number;
  privacy_mode: 'contributions_only' | 'show_categories';
  members: GroupMember[];
  recent_contributions: GroupContribution[];
}

export type EcosystemState = 'thriving' | 'growing' | 'struggling' | 'dormant';

export interface EcosystemHealth {
  score: number;
  state: EcosystemState;
  leaves_count: number;
  flowers_count: number;
  description: string;
  aria_speech: string;
}

export interface AccessibilitySettings {
  high_contrast: boolean;
  reduced_motion: boolean;
  simplified_mode: boolean;
  screen_reader_friendly: boolean;
  text_scale: number;
  audio_feedback: boolean;
  voice_speed: number;
}

export interface EmotionalProfile {
  declared_sentiment: 'calm' | 'anxious' | 'optimistic' | 'overwhelmed';
  stress_level: 'low' | 'moderate' | 'high';
  assistant_tone: 'empathetic' | 'concise' | 'motivational';
  learned_categories: Record<string, string>;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  currency: string;
  symbol: string;
  monthly_budget: number;
  weekly_budget: number;
  current_week_spent: number;
  ecosystem_type: 'tree' | 'fish' | 'garden';
  accessibility_profile: AccessibilitySettings;
  emotional_profile: EmotionalProfile;
}

export interface LLMInterpretation {
  amount: number | null;
  currency: string;
  category: string;
  description: string;
  date: string;
  confidence: number;
  raw_text: string;
  suggested_advice?: string;
  requires_clarification?: boolean;
  clarification_question?: string;
}

export interface WeeklyInsight {
  period: string;
  total_spent: number;
  top_categories: { category: string; amount: number; percentage: number }[];
  pattern_detected: string;
  actionable_advice: string;
  non_judgmental_score: number;
}
