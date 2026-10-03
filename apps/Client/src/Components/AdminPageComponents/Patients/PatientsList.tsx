import { useCallback, useEffect, useState } from "react";
import { ChevronRight, Search, UserPlus, Users } from "lucide-react";
import PageHeader from "../../PortalComponents/PageHeader";
import EmptyState from "../../PortalComponents/EmptyState";
import Avatar from "../../PortalComponents/Avatar";
import Button from "../../Button";
import { adminService } from "../../../API/services/adminService";
import { useApiQuery } from "../../../Hooks/Api/useApiQuery";
import { showToast } from "../../../utils/toastHelper";
import PersonForm from "../PersonForm";
import { ActivationPill, Pager } from "../ui";

type Props = {
  onOpen: (id: string) => void;
  // Open the register form straight away (from the overview's quick action).
  startRegistering?: boolean;
};

export default function PatientsList({ onOpen, startRegistering = false }: Props) {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [registering, setRegistering] = useState(startRegistering);

  // Search as the admin types, after a short pause.
  useEffect(() => {
    const id = window.setTimeout(() => {
      setSearch(query.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(id);
  }, [query]);

  // Refetches whenever the search or page changes.
  const load = useCallback(() => adminService.listPatients(search, page), [search, page]);
  const { data, error } = useApiQuery(load, "Couldn't load patients");

  return (
    <div className="w-full">
      {registering && (
        <PersonForm
          title="Register a patient"
          subtitle="Add someone from the hospital's records so they can activate their portal account."
          idLabel="Patient ID"
          submitLabel="Register patient"
          onClose={() => setRegistering(false)}
          onSubmit={async (payload) => {
            const patient = await adminService.createPatient(payload);
            showToast(`Registered ${patient.firstname} ${patient.lastname} (${patient.userId})`, "success");
            setRegistering(false);
            onOpen(patient.id);
          }}
        />
      )}

      <PageHeader
        title="Patients"
        description="Register patients, keep their details up to date and add documents to their records."
        action={
          <Button type="button" width="w-full sm:w-auto" className="px-5" content={<><UserPlus size={18} /> Register patient</>} onClick={() => setRegistering(true)} />
        }
      />

      <label className="relative mt-6 block w-full sm:max-w-sm">
        <span className="absolute left-3 top-1/2 -translate-y-1/2">
          <Search color="#605E5E" size={16} />
        </span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, patient ID or email"
          aria-label="Search patients"
          className="h-11 w-full rounded-lg border border-[#E7E4E4] bg-white pl-9 pr-3 text-sm focus:outline-none focus:border-[#28574E]"
        />
      </label>

      <div className="mt-6">
        {!data ? (
          error ? (
            <EmptyState icon={<Users size={28} />} title="We couldn't load patients" description={error} />
          ) : (
            <p className="py-10 text-center text-[#707070]">Loading patients…</p>
          )
        ) : data.people.length === 0 ? (
          <div className="rounded-xl border border-[#D7D7D7] bg-white">
            <EmptyState
              icon={<Users size={28} />}
              title={search ? "No matching patients" : "No patients yet"}
              description={search ? "Try a different name, ID or email." : "Register a patient to get started."}
            />
          </div>
        ) : (
          <>
            <ul className="divide-y divide-[#E6E3E3] overflow-hidden rounded-xl border border-[#D7D7D7] bg-white">
              {data.people.map((p) => (
                <li key={p.id}>
                  <button type="button" onClick={() => onOpen(p.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 sm:px-5">
                    <Avatar name={`${p.firstname} ${p.lastname}`} image={p.img} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate fontOutfit font-medium">{p.firstname} {p.lastname}</span>
                      <span className="block truncate text-xs text-[#757575]">{p.userId} · {p.email}</span>
                    </span>
                    <ActivationPill activated={p.activated} />
                    <ChevronRight size={18} className="shrink-0 text-[#757575]" />
                  </button>
                </li>
              ))}
            </ul>
            <Pager page={data.page} pageSize={data.pageSize} total={data.total} onPage={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
