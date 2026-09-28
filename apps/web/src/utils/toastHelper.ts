import { toast } from "react-toastify";

let lastToastTime = 0;

export const showToast = (
  message: string,
  type: "success" | "error" | "info" | "warn" = "success",
  windowMs = 700
) => {
  const now = Date.now();
  if (now - lastToastTime < windowMs) return;
  lastToastTime = now;
  toast[type](message);
};
