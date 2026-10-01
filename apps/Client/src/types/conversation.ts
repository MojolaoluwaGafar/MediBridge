// Patient <-> doctor messaging. (types/message.ts is the AI chat bubble.)

export interface IConversationContact {
  // Doctor profile ID when the viewer is a patient; patient user ID for doctors.
  id: string;
  name: string;
  image: string | null;
  subtitle: string;
}

export interface IConversationMessage {
  id: string;
  sender: "patient" | "doctor";
  body: string;
  createdAt: string;
  readAt: string | null;
}

export interface IConversationSummary {
  contact: IConversationContact;
  lastMessage: IConversationMessage | null;
  unreadCount: number;
}
