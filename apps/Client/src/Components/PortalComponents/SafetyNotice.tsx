import { TriangleAlert } from "lucide-react";

type Props = {
  level: "urgent" | "emergency";
  message: string;
};

// Shown when safety triage marks something the patient wrote as urgent or an
// emergency. Uses role="alert" so screen readers announce it straight away.
export default function SafetyNotice({ level, message }: Props) {
  const styles =
    level === "emergency"
      ? "border-red-300 bg-red-50 text-red-800"
      : "border-amber-300 bg-amber-50 text-amber-900";

  return (
    <div role="alert" className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${styles}`}>
      <TriangleAlert size={18} className="mt-0.5 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
