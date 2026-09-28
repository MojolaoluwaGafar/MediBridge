const emergencyKeywords = [
  "kill myself",
  "end my life",
  "suicide plan",
  "how to commit suicide"
];

export function isEmergency(message: string): boolean {
  return emergencyKeywords.some(keyword =>
    message.toLowerCase().includes(keyword)
  );
}