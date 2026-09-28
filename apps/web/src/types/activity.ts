export type Activity = {
    _id? : string;
    type: "confirmed" | "rescheduled" | "cancelled";
    message: string;
    timestamp: string;
};
