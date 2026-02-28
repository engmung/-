export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text?: string;
  imageUrl?: string;
  base64Data?: string;
  mimeType?: string;
  timestamp: string; // Changed to string for easier localStorage handling
}

export interface QuestState {
  currentLevel: number;
  completedQuests: number;
}
