export interface IMessage {
    id? : number,
    isMine?: boolean
    text: string
    timestamp?: string
    // Set on AI replies when safety triage rated the user's message.
    urgency?: "routine" | "urgent" | "emergency"
}

export type Message = {
  sender: "user" | "ai";
  text: string;
};