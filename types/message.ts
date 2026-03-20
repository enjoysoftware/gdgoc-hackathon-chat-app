// Message interface for chat application
export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  timestamp: any; // Firestore Timestamp
  mentions?: string[]; // Optional for backwards compatibility
}

export interface UserProfile {
  displayName: string;
  photoURL: string;
  status?: "online" | "offline";
}
