// Date formats used across the portal, in one place so pages stay consistent.

// "Thursday, July 2, 2026"
export const formatLongDate = (value: string | Date) =>
  new Date(value).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// "3:00 AM"
export const formatTime = (value: string | Date) =>
  new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

// A time for today's messages, otherwise a short date ("Jul 2").
export const formatMessageStamp = (value: string | Date) => {
  const date = new Date(value);
  const isToday = date.toDateString() === new Date().toDateString();
  return isToday
    ? formatTime(date)
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};
