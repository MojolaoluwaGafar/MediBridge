import { useMemo, useState } from "react";
import { ChevronRight, Search, Users } from "lucide-react";
import PageHeader from "../../PortalComponents/PageHeader";
import EmptyState from "../../PortalComponents/EmptyState";
import Avatar from "../../PortalComponents/Avatar";
import { useApiQuery } from "../../../Hooks/Api/useApiQuery";
import { doctorPortalService } from "../../../API/services/doctorPortalService";
import { todayDateString } from "../../../utils/formatDate";
import { dayHeading, mediumDate } from "../../../utils/doctorFormat";

type Props = { onOpen: (patientId: string) => void };

// Everyone who has booked with this doctor, soonest next visit first.
export default function PatientList({ onOpen }: Props) {
  const patients = useApiQuery(doctorPortalService.getPatients, "Couldn't load your patients");
  const [search, setSearch] = useState("");
  const today = todayDateString();

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    const all = patients.data ?? [];
    return term ? all.filter((p) => `${p.firstname} ${p.lastname} ${p.userId}`.toLowerCase().includes(term)) : all;
  }, [patients.data, search]);

  return (
    <div className="w-full">
      <PageHeader title="Patients" description="Everyone who has booked an appointment with you." />

      <label className="relative mt-6 block w-full sm:max-w-sm">
        <span className="absolute left-3 top-1/2 -translate-y-1/2">
          <Search color="#605E5E" size={16} />
        </span>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or patient ID"
          aria-label="Search patients"
          className="h-11 w-full rounded-lg border border-[#E7E4E4] bg-white pl-9 pr-3 text-sm focus:outline-none focus:border-[#28574E]"
        />
      </label>

      <div className="mt-6">
        {!patients.data ? (
          patients.error ? (
            <EmptyState icon={<Users size={28} />} title="We couldn't load your patients" description={patients.error} />
          ) : (
            <p className="py-10 text-center text-[#707070]">Loading patients…</p>
          )
        ) : visible.length === 0 ? (
          <div className="rounded-xl border border-[#D7D7D7] bg-white">
            <EmptyState
              icon={<Users size={28} />}
              title={search ? "No matching patients" : "No patients yet"}
              description={search ? "Try a different name or ID." : "Patients appear here once they book an appointment with you."}
            />
          </div>
        ) : (
          <ul className="divide-y divide-[#E6E3E3] overflow-hidden rounded-xl border border-[#D7D7D7] bg-white">
            {/* Column headings for wide screens. */}
            <li className="hidden grid-cols-[minmax(0,2fr)_1fr_1fr_6rem_1.5rem] gap-4 bg-[#F7F8F8] px-5 py-3 text-xs font-medium uppercase tracking-wide text-[#757575] md:grid">
              <span>Patient</span>
              <span>Next visit</span>
              <span>Last visit</span>
              <span>Visits</span>
              <span />
            </li>
            {visible.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onOpen(p.id)}
                  className="grid w-full grid-cols-[minmax(0,1fr)_1.5rem] items-center gap-4 px-4 py-3 text-left hover:bg-gray-50 sm:px-5 md:grid-cols-[minmax(0,2fr)_1fr_1fr_6rem_1.5rem]"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <Avatar name={`${p.firstname} ${p.lastname}`} image={p.img} />
                    <span className="min-w-0">
                      <span className="block truncate fontOutfit font-medium">{p.firstname} {p.lastname}</span>
                      <span className="block text-xs text-[#757575]">
                        ID {p.userId}
                        {/* Phones: the next visit sits under the name. */}
                        <span className="md:hidden">{p.nextVisit ? ` · Next: ${dayHeading(p.nextVisit, today)}` : ""}</span>
                      </span>
                    </span>
                  </span>
                  <span className="hidden text-sm md:block">{p.nextVisit ? dayHeading(p.nextVisit, today) : "—"}</span>
                  <span className="hidden text-sm text-[#605E5E] md:block">{p.lastVisit ? mediumDate(p.lastVisit) : "—"}</span>
                  <span className="hidden text-sm text-[#605E5E] md:block">{p.visits}</span>
                  <ChevronRight size={18} className="text-[#757575]" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
