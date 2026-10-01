import { Link } from "react-router";
import InfoPage from "../Components/InfoPage";

// Plain-language terms for using the portal. Have the hospital's legal team
// review them before relying on them.
export default function TermsPage() {
  return (
    <InfoPage
      title="Terms of Service"
      intro="The basics of using the MediBridge patient portal."
      updated="1 October 2026"
      sections={[
        {
          heading: "Using the portal",
          body: (
            <p>
              The portal lets registered patients book and manage appointments, read their medical records, message their
              doctors and get general guidance from an AI assistant. Accounts are created by the hospital; you activate
              yours with your Patient ID, email and registered phone number.
            </p>
          ),
        },
        {
          heading: "Not for emergencies",
          body: (
            <p>
              The portal is not an emergency service. Messages may not be read straight away. If you think you are having
              a medical emergency, call your local emergency number or go to the nearest emergency department now.
            </p>
          ),
        },
        {
          heading: "The AI assistant",
          body: (
            <p>
              The AI assistant gives general information only. It is not a doctor, cannot diagnose you or prescribe
              treatment, and can make mistakes. Always follow the advice of your care team.
            </p>
          ),
        },
        {
          heading: "Your account",
          body: (
            <p>
              Keep your password and one-time codes private. You are responsible for activity on your account. Tell the
              hospital straight away if you think someone else has used it.
            </p>
          ),
        },
        {
          heading: "Appointments",
          body: (
            <p>
              Appointments are booked in the times your doctor makes available. Rescheduling is possible up to 7 days
              before an appointment; for anything later, please contact the hospital. Please cancel appointments you
              can't attend so someone else can use the slot.
            </p>
          ),
        },
        {
          heading: "Acceptable use",
          body: (
            <p>
              Use the portal only for your own care. Don't try to access other people's information, disrupt the
              service, or send abusive messages to staff.
            </p>
          ),
        },
        {
          heading: "Questions",
          body: (
            <p>
              See our <Link to="/privacy" className="text-[#28574E] underline">Privacy Policy</Link> for how your
              information is used, or <Link to="/contact" className="text-[#28574E] underline">contact the hospital</Link>.
            </p>
          ),
        },
      ]}
    />
  );
}
