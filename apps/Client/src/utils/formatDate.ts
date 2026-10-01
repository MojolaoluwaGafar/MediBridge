// Date and time formatting shared by the portal pages, so every screen shows
// dates the same way.

const toDate = (value: string | Date) => (value instanceof Date ? value : new Date(value));

// "Thursday, July 2, 2026"
export const formatLongDate = (value: string | Date) =>
  toDate(value).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// "3:00 AM"
export const formatTime = (value: string | Date) =>
  toDate(value).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

// For conversation lists: a time today, "Yesterday", or a short date.
export const formatRelativeDay = (value: string | Date) => {
  const date = toDate(value);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, now)) return formatTime(date);
  if (isSameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: "numeric" }),
  });
};

// Under a chat message: "3:00 AM" today, otherwise "Yesterday, 3:00 AM" or "Jul 2, 3:00 AM".
export const formatMessageTime = (value: string | Date) => {
  const date = toDate(value);
  return isSameDay(date, new Date())
    ? formatTime(date)
    : `${formatRelativeDay(date)}, ${formatTime(date)}`;
};

// Every way a patient might type a date when searching ("May 2026", "july 2",
// "2026-07-02"), so a plain text match finds it.
export const searchableDate = (value: string | Date) => {
  const date = toDate(value);
  return [
    formatLongDate(date),
    date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    date.toISOString().slice(0, 10),
  ].join(" ");
};
