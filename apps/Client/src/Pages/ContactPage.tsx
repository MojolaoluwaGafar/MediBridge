import { Link } from "react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import InfoPage, { type InfoSection } from "../Components/InfoPage";

// The hospital's contact details come from the environment (VITE_HOSPITAL_*),
// so they are set per deployment and never hard-coded. Only the ones that are
// set are shown.
const CONTACT = {
  phone: import.meta.env.VITE_HOSPITAL_PHONE as string | undefined,
  email: import.meta.env.VITE_HOSPITAL_EMAIL as string | undefined,
  address: import.meta.env.VITE_HOSPITAL_ADDRESS as string | undefined,
  hours: import.meta.env.VITE_HOSPITAL_HOURS as string | undefined,
};

export default function ContactPage() {
  const details = [
    CONTACT.phone && { icon: <Phone size={18} />, label: "Phone", value: <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="underline">{CONTACT.phone}</a> },
    CONTACT.email && { icon: <Mail size={18} />, label: "Email", value: <a href={`mailto:${CONTACT.email}`} className="underline">{CONTACT.email}</a> },
    CONTACT.address && { icon: <MapPin size={18} />, label: "Address", value: CONTACT.address },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: React.ReactNode }[];

  const sections: InfoSection[] = [
    {
      heading: "In an emergency",
      body: (
        <p className="font-medium">
          Call your local emergency number or go to the nearest emergency department now. Don't wait for an online reply.
        </p>
      ),
    },
    {
      heading: "Questions about your care",
      body: (
        <p>
          If you're a patient, <Link to="/login" className="text-[#28574E] underline">sign in to the portal</Link> and
          use <strong>Messages</strong> to reach a doctor you have an appointment with, or manage your visits under{" "}
          <strong>Appointments</strong>.
        </p>
      ),
    },
    {
      heading: "General questions",
      body: (
        <p>
          The <Link to="/support" className="text-[#28574E] underline">AI Support</Link> page can help you find the right
          department, prepare for a visit or understand how the portal works.
        </p>
      ),
    },
  ];

  if (details.length) {
    sections.push({
      heading: "Contact the hospital",
      body: (
        <>
          <ul className="space-y-3">
            {details.map((d) => (
              <li key={d.label} className="flex items-start gap-3">
                <span className="mt-0.5 text-[#28574E]">{d.icon}</span>
                <span>
                  <span className="block text-sm text-[#757575]">{d.label}</span>
                  {d.value}
                </span>
              </li>
            ))}
          </ul>
          {CONTACT.hours && <p className="text-sm text-[#757575]">{CONTACT.hours}</p>}
        </>
      ),
    });
  }

  return (
    <InfoPage
      title="Contact"
      intro="How to reach the hospital and your care team."
      sections={sections}
    />
  );
}
