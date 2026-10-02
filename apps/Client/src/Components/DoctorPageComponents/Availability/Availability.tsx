import { useEffect, useMemo, useState } from "react";
import { Plus, TriangleAlert, X } from "lucide-react";
import PageHeader from "../../PortalComponents/PageHeader";
import Button from "../../Button";
import { doctorPortalService } from "../../../API/services/doctorPortalService";
import type { IDoctorAppointment, IDoctorProfile, IWorkingWindow } from "../../../types/doctorPortal";
import { apiErrorMessage } from "../../../utils/apiError";
import { showToast } from "../../../utils/toastHelper";
import { minutesOf, patientName, shortDate } from "../../../utils/doctorFormat";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const label = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

// Every half hour from 6 AM to 10 PM.
const TIME_OPTIONS = Array.from({ length: 33 }, (_, i) => label(6 * 60 + i * 30));

type Block = { start: number; end: number };
type Week = Record<string, Block[]>;

const toWeek = (windows: IWorkingWindow[]): Week =>
  Object.fromEntries(
    DAYS.map((day) => [
      day,
      windows
        .filter((w) => w.day === day)
        .map((w) => ({ start: minutesOf(w.start), end: minutesOf(w.end) }))
        .sort((a, b) => a.start - b.start),
    ])
  );

const toWindows = (week: Week): IWorkingWindow[] =>
  DAYS.flatMap((day) => week[day].map((b) => ({ day, start: label(b.start), end: label(b.end) })));

// What's wrong with a day's blocks, if anything, so Save can be held back.
function dayProblem(blocks: Block[], slotMinutes: number): string | null {
  const sorted = [...blocks].sort((a, b) => a.start - b.start);
  for (const [i, b] of sorted.entries()) {
    if (b.end - b.start < slotMinutes) return `Each block needs at least ${slotMinutes} minutes.`;
    if (i > 0 && b.start < sorted[i - 1].end) return "Two blocks overlap.";
  }
  return null;
}

type Props = {
  doctor: IDoctorProfile;
  onSaved: (doctor: IDoctorProfile) => void;
};

export default function Availability({ doctor, onSaved }: Props) {
  const [accepting, setAccepting] = useState(doctor.availability);
  const [week, setWeek] = useState<Week>(() => toWeek(doctor.availableTime));
  const [saving, setSaving] = useState(false);
  const [outsideHours, setOutsideHours] = useState<IDoctorAppointment[]>([]);
  const slotMinutes = doctor.slotMinutes || 30;

  // Start again from the saved profile whenever it changes (e.g. after saving).
  useEffect(() => {
    setAccepting(doctor.availability);
    setWeek(toWeek(doctor.availableTime));
  }, [doctor]);

  const savedWindows = JSON.stringify(doctor.availableTime);
  const dirty = accepting !== doctor.availability || JSON.stringify(toWindows(week)) !== savedWindows;
  const problems = useMemo(
    () => Object.fromEntries(DAYS.map((day) => [day, dayProblem(week[day], slotMinutes)])),
    [week, slotMinutes]
  );
  const hasProblem = Object.values(problems).some(Boolean);
  const slotsPerWeek = DAYS.reduce(
    (sum, day) => sum + week[day].reduce((s, b) => s + Math.max(0, Math.floor((b.end - b.start) / slotMinutes)), 0),
    0
  );

  const update = (day: string, blocks: Block[]) => setWeek((w) => ({ ...w, [day]: blocks }));
  const addBlock = (day: string) => {
    const blocks = week[day];
    const last = blocks[blocks.length - 1];
    const start = last ? Math.min(last.end + 60, 21 * 60) : 9 * 60;
    update(day, [...blocks, { start, end: Math.min(start + 4 * 60, 22 * 60) }]);
  };

  const save = async () => {
    setSaving(true);
    try {
      const result = await doctorPortalService.updateAvailability({ availability: accepting, availableTime: toWindows(week) });
      setOutsideHours(result.outsideHours);
      showToast("Availability saved", "success");
      onSaved(result.doctor);
    } catch (err) {
      showToast(apiErrorMessage(err, "Couldn't save your availability"), "error");
    } finally {
      setSaving(false);
    }
  };

  const select = (value: number, onChange: (v: number) => void, aria: string) => (
    <select
      aria-label={aria}
      value={label(value)}
      onChange={(event) => onChange(minutesOf(event.target.value))}
      className="h-10 rounded-md border border-[#D9D9D9] bg-white px-2 text-sm focus:outline-none focus:border-[#28574E]"
    >
      {/* Keep an unusual saved time selectable even if it's off the half-hour grid. */}
      {!TIME_OPTIONS.includes(label(value)) && <option>{label(value)}</option>}
      {TIME_OPTIONS.map((t) => (
        <option key={t}>{t}</option>
      ))}
    </select>
  );

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Availability"
        description={`Set the hours patients can book you. Each appointment is ${slotMinutes} minutes.`}
        action={
          <div className="flex gap-2">
            {dirty && (
              <Button
                type="button"
                width="w-full sm:w-auto"
                variant="outline"
                className="px-5"
                content="Discard"
                onClick={() => {
                  setAccepting(doctor.availability);
                  setWeek(toWeek(doctor.availableTime));
                }}
              />
            )}
            <Button
              type="button"
              width="w-full sm:w-auto"
              className="px-6"
              content={saving ? "Saving…" : "Save changes"}
              disabled={!dirty || saving || hasProblem}
              onClick={save}
            />
          </div>
        }
      />

      <section className="flex flex-col gap-3 rounded-xl border border-[#D7D7D7] bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <p className="fontOutfit font-medium">Accepting new bookings</p>
          <p className="text-sm text-[#605E5E]">
            {accepting
              ? `Patients can book any free slot in your hours (${slotsPerWeek} slot${slotsPerWeek === 1 ? "" : "s"} a week).`
              : "Patients can't book new appointments with you. Existing appointments are kept."}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={accepting}
          aria-label="Accepting new bookings"
          onClick={() => setAccepting((v) => !v)}
          className={`relative h-7 w-12 shrink-0 rounded-full transition ${accepting ? "bg-[#28574E]" : "bg-[#C9C9C9]"}`}
        >
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${accepting ? "left-6" : "left-1"}`} />
        </button>
      </section>

      {outsideHours.length > 0 && (
        <section className="rounded-xl border border-[#F2D19B] bg-[#FFF8EC] p-4 sm:p-5">
          <p className="flex items-center gap-2 fontOutfit font-medium text-[#8A5A00]">
            <TriangleAlert size={18} /> {outsideHours.length} booked visit{outsideHours.length === 1 ? " is" : "s are"} outside your new hours
          </p>
          <p className="pt-1 text-sm text-[#6B4A00]">
            They're still booked. Keep them, or cancel them from Appointments so the patients can rebook.
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            {outsideHours.slice(0, 8).map((a) => (
              <li key={a._id}>
                {shortDate(a.date)}, {a.time} · {patientName(a)}
              </li>
            ))}
            {outsideHours.length > 8 && <li className="text-[#757575]">and {outsideHours.length - 8} more</li>}
          </ul>
        </section>
      )}

      <section className={`divide-y divide-[#E6E3E3] rounded-xl border border-[#D7D7D7] bg-white ${accepting ? "" : "opacity-70"}`}>
        {DAYS.map((day) => {
          const blocks = week[day];
          const working = blocks.length > 0;
          return (
            <div key={day} className="flex flex-col gap-3 p-4 sm:p-5 md:flex-row md:items-start">
              <label className="flex w-40 shrink-0 items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  checked={working}
                  onChange={(event) => update(day, event.target.checked ? [{ start: 9 * 60, end: 17 * 60 }] : [])}
                  className="h-4 w-4 accent-[#28574E]"
                />
                <span className="fontOutfit font-medium">{day}</span>
              </label>

              <div className="flex-1 space-y-2">
                {!working && <p className="pt-2 text-sm text-[#757575]">Not working</p>}
                {blocks.map((block, index) => (
                  <div key={index} className="flex flex-wrap items-center gap-2">
                    {select(block.start, (start) => update(day, blocks.map((b, i) => (i === index ? { ...b, start } : b))), `${day} block ${index + 1} start`)}
                    <span className="text-sm text-[#605E5E]">to</span>
                    {select(block.end, (end) => update(day, blocks.map((b, i) => (i === index ? { ...b, end } : b))), `${day} block ${index + 1} end`)}
                    <button
                      type="button"
                      onClick={() => update(day, blocks.filter((_, i) => i !== index))}
                      aria-label={`Remove ${day} block ${index + 1}`}
                      className="rounded-md p-2 text-[#605E5E] hover:bg-gray-100"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {problems[day] && <p className="text-sm text-red-700">{problems[day]}</p>}
              </div>

              {working && (
                <button
                  type="button"
                  onClick={() => addBlock(day)}
                  className="flex items-center gap-1 self-start pt-2 text-sm font-medium text-[#28574E] hover:underline"
                >
                  <Plus size={16} /> Add hours
                </button>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
