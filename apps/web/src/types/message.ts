export interface IMessage {
    id? : number,
    isMine?: boolean
    text: string
    timestamp?: string
}

export type Message = {
  sender: "user" | "ai";
  text: string;
};