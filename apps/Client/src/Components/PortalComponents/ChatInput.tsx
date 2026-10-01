import { useState, type FormEvent } from "react";
import { SendHorizontal } from "lucide-react";

type Props = {
  placeholder: string;
  disabled?: boolean;
  maxLength?: number;
  // Return false to keep the text (e.g. the message failed to send).
  onSend: (text: string) => Promise<boolean | void> | boolean | void;
  // Lets a parent fill the box, e.g. from a suggestion chip.
  value?: string;
  onValueChange?: (value: string) => void;
};

// The message box used by both Messages and AI Support.
export default function ChatInput({
  placeholder,
  disabled = false,
  maxLength = 2000,
  onSend,
  value: controlledValue,
  onValueChange,
}: Props) {
  const [ownValue, setOwnValue] = useState("");
  const value = controlledValue ?? ownValue;
  const setValue = onValueChange ?? setOwnValue;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const text = value.trim();
    if (!text || disabled) return;

    setValue("");
    const result = await onSend(text);
    if (result === false) setValue(text);
  };

  return (
    <form onSubmit={submit} className="relative">
      <input
        type="text"
        value={value}
        maxLength={maxLength}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => setValue(event.target.value)}
        className="h-11 w-full rounded-md border border-[#C2C6D4] bg-[#DCF2EE99] pl-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#28574E] disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="Send"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[#141313] hover:bg-white/60 disabled:opacity-40"
      >
        <SendHorizontal size={20} />
      </button>
    </form>
  );
}
