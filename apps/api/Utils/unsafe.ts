export const unsafeKeywords = [
  "suicide",
  "kill myself",
  "end my life",
  "self harm",
  "bomb",
  "murder",
  "hate crime",
  "overdose"
];

export function getUnsafeReason(message: string): string | null {
  const lowerMessage = message.toLowerCase();

  const matchedKeyword = unsafeKeywords.find(keyword =>
    lowerMessage.includes(keyword)
  );

  return matchedKeyword || null;
}