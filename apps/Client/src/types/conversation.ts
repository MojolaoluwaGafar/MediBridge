// Patient <-> doctor messaging. The same shapes serve the doctor portal, where
// the contact is a patient instead of a doctor.

export interface IContact {
  id: string;
  name: string;
  image: string | null;
  subtitle: string;
}

export interface IDirectMessage {
  id: string;
  sender: "patient" | "doctor";
  body: string;
  createdAt: string;
  readAt: string | null;
}

export interface IConversationSummary {
  contact: IContact;
  lastMessage: IDirectMessage | null;
  unreadCount: number;
}

export interface IGetConversationsRes {
  success: boolean;
  conversations: IConversationSummary[];
}

export interface IGetConversationRes {
  success: boolean;
  contact: IContact | null;
  messages: IDirectMessage[];
}

export interface ISendMessageRes {
  success: boolean;
  message: IDirectMessage;
  urgency: "routine" | "urgent" | "emergency";
  safetyMessage?: string;
}

export interface ISafetyNotice {
  level: "urgent" | "emergency";
  message: string;
}
