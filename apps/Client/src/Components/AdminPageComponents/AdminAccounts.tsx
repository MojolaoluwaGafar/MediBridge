import { useState } from "react";
import { UserCog } from "lucide-react";
import PageHeader from "../PortalComponents/PageHeader";
import EmptyState from "../PortalComponents/EmptyState";
import Avatar from "../PortalComponents/Avatar";
import Button from "../Button";
import { useApiQuery } from "../../Hooks/Api/useApiQuery";
import { adminService } from "../../API/services/adminService";
import { showToast } from "../../utils/toastHelper";
import PersonForm from "./PersonForm";
import { ActivationPill } from "./ui";

const loadAdmins = () => adminService.listAdmins();

// Other people who can use this portal. They activate their own account.
export default function AdminAccounts() {
  const admins = useApiQuery(loadAdmins, "Couldn't load admin accounts");
  const [adding, setAdding] = useState(false);

  return (
    <div className="w-full">
      {adding && (
        <PersonForm
          title="Add an admin"
          subtitle="Admins can register patients, upload documents and manage doctors and departments."
          idLabel="Staff ID"
          submitLabel="Create admin account"
          onClose={() => setAdding(false)}
          onSubmit={async (payload) => {
            const account = await adminService.createAdmin(payload);
            showToast(`Admin account ${account.userId} created`, "success");
            setAdding(false);
            admins.refetch().catch(() => {});
          }}
        />
      )}
      <PageHeader
        title="Admin accounts"
        description="Hospital staff who can use this portal."
        action={<Button type="button" width="w-full sm:w-auto" className="px-5" content="Add admin" onClick={() => setAdding(true)} />}
      />
      <div className="mt-6">
        {!admins.data ? (
          admins.error ? (
            <EmptyState icon={<UserCog size={28} />} title="We couldn't load admin accounts" description={admins.error} />
          ) : (
            <p className="py-10 text-center text-[#707070]">Loading…</p>
          )
        ) : (
          <ul className="divide-y divide-[#E6E3E3] overflow-hidden rounded-xl border border-[#D7D7D7] bg-white">
            {admins.data.people.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                <Avatar name={`${a.firstname} ${a.lastname}`} image={a.img} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate fontOutfit font-medium">{a.firstname} {a.lastname}</span>
                  <span className="block truncate text-xs text-[#757575]">{a.userId} · {a.email}</span>
                </span>
                <ActivationPill activated={a.activated} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
