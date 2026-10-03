import { useMemo, useState } from "react";
import { ChevronRight, Search, Stethoscope } from "lucide-react";
import PageHeader from "../../PortalComponents/PageHeader";
import EmptyState from "../../PortalComponents/EmptyState";
import DoctorPhoto from "../../PortalComponents/DoctorPhoto";
import Button from "../../Button";
import { useApiQuery } from "../../../Hooks/Api/useApiQuery";
import { adminService } from "../../../API/services/adminService";
import { showToast } from "../../../utils/toastHelper";
import DoctorForm from "./DoctorForm";
import { Pill } from "../ui";

type Props = { onOpen: (id: string) => void; startAdding?: boolean };

export default function DoctorsList({ onOpen, startAdding = false }: Props) {
  const doctors = useApiQuery(adminService.listDoctors, "Couldn't load doctors");
  const [adding, setAdding] = useState(startAdding);
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    const all = doctors.data ?? [];
    return term ? all.filter((d) => `${d.docName} ${d.department} ${d.account?.userId ?? ""}`.toLowerCase().includes(term)) : all;
  }, [doctors.data, search]);

  return (
    <div className="w-full">
      {adding && (
        <DoctorForm
          onClose={() => setAdding(false)}
          onSaved={(id) => {
            showToast("Doctor added", "success");
            setAdding(false);
            onOpen(id);
          }}
        />
      )}

      <PageHeader
        title="Doctors"
        description="Doctor profiles patients can book, their hours, and their logins for the doctor portal."
        action={<Button type="button" width="w-full sm:w-auto" className="px-5" content="Add doctor" onClick={() => setAdding(true)} />}
      />

      <label className="relative mt-6 block w-full sm:max-w-sm">
        <span className="absolute left-3 top-1/2 -translate-y-1/2">
          <Search color="#605E5E" size={16} />
        </span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or department"
          aria-label="Search doctors"
          className="h-11 w-full rounded-lg border border-[#E7E4E4] bg-white pl-9 pr-3 text-sm focus:outline-none focus:border-[#28574E]"
        />
      </label>

      <div className="mt-6">
        {!doctors.data ? (
          doctors.error ? (
            <EmptyState icon={<Stethoscope size={28} />} title="We couldn't load doctors" description={doctors.error} />
          ) : (
            <p className="py-10 text-center text-[#707070]">Loading doctors…</p>
          )
        ) : visible.length === 0 ? (
          <div className="rounded-xl border border-[#D7D7D7] bg-white">
            <EmptyState icon={<Stethoscope size={28} />} title="No doctors found" description="Try another search, or add a doctor." />
          </div>
        ) : (
          <ul className="divide-y divide-[#E6E3E3] overflow-hidden rounded-xl border border-[#D7D7D7] bg-white">
            {visible.map((d) => (
              <li key={d._id}>
                <button type="button" onClick={() => onOpen(d._id)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 sm:px-5">
                  <DoctorPhoto name={d.docName} image={d.docImg} className="h-11 w-11 rounded-full text-sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate fontOutfit font-medium">{d.docName}</span>
                    <span className="block truncate text-xs text-[#757575]">
                      {d.department} · {d.availableTime.length ? `${new Set(d.availableTime.map((w) => w.day)).size} days a week` : "no hours set"} · {d.upcomingAppointments} upcoming
                    </span>
                  </span>
                  <span className="hidden flex-wrap justify-end gap-1 sm:flex">
                    {!d.availability && <Pill tone="gray">Not taking bookings</Pill>}
                    {d.account ? (
                      d.account.activated ? <Pill tone="green">Portal login</Pill> : <Pill tone="amber">Login not activated</Pill>
                    ) : (
                      <Pill tone="blue">No login</Pill>
                    )}
                  </span>
                  <ChevronRight size={18} className="shrink-0 text-[#757575]" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
