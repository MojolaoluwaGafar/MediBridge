export type Activity = {
    _id? : string;
    type: "confirmed" | "rescheduled" | "cancelled" | "record";
    message: string;
    timestamp: string;
};
