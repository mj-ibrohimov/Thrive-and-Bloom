// User type used throughout authentication, store and context
export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

// Optional: extend with other common types
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// ADHD Support Chatbot Types
export type ADHDIntent = 
  | 'task_breakdown'
  | 'focus_session'
  | 'stress_management'
  | 'mood_checkin'
  | 'learning_tip'
  | 'distress_escalation'
  | 'general_support'
  | 'unknown';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  followUpOptions?: FollowUpOption[];
  isTyping?: boolean;
}

export interface ChatContext {
  messages: ChatMessage[];
  userProfile?: {
    name?: string;
    preferences?: string[];
    currentMood?: string;
    stressLevel?: number;
  };
  sessionData?: {
    focusSessionActive?: boolean;
    lastMoodCheckIn?: Date;
    recentIntents?: string[];
  };
}

export interface FollowUpOption {
  id: string;
  text: string;
  emoji: string;
}

export interface ChatbotResponse {
  reply: string;
  actions: string[];
  followUpOptions?: FollowUpOption[];
  intent?: ADHDIntent;
  confidence?: number;
}

export interface IntentDetectionResult {
  intent: ADHDIntent;
  confidence: number;
  keywords: string[];
}