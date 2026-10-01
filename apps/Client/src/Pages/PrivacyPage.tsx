import { Link } from "react-router";
import InfoPage from "../Components/InfoPage";

// Describes what the portal actually does with information. Keep it in step
// with the code, and have the hospital's privacy or legal team review it.
export default function PrivacyPage() {
  return (
    <InfoPage
      title="Privacy Policy"
      intro="How the MediBridge patient portal uses and protects your information."
      updated="1 October 2026"
      sections={[
        {
          heading: "Who this covers",
          body: (
            <p>
              This page explains how the MediBridge patient portal handles the information of patients and visitors who
              use it. It applies alongside the hospital's own policies for your care and medical records.
            </p>
          ),
        },
        {
          heading: "Information the portal holds",
          body: (
            <ul className="list-disc space-y-1 pl-5">
              <li>Your registration details from the hospital: name, Patient ID, email address and phone number.</li>
              <li>Your appointments, including the reason for each visit you give when booking.</li>
              <li>Medical records the hospital adds to your account.</li>
              <li>Messages between you and your doctors.</li>
              <li>Conversations with the AI assistant while you're signed in, and a profile photo if you add one.</li>
              <li>A record of account activity, such as bookings, changes and cancellations.</li>
            </ul>
          ),
        },
        {
          heading: "How it is used",
          body: (
            <>
              <p>
                To run the portal: booking and managing appointments, letting you read your records, passing messages
                between you and your care team, and sending you activation and password-reset codes.
              </p>
              <p>
                For your safety, what you write when booking, in messages and to the AI assistant is checked for signs
                of an emergency or risk of harm. Anything flagged is shown to the hospital's care team so they can follow
                up.
              </p>
            </>
          ),
        },
        {
          heading: "Who can see it",
          body: (
            <ul className="list-disc space-y-1 pl-5">
              <li>You can see your own appointments, records and messages.</li>
              <li>Doctors see the appointments and messages you have with them. They can only see your records for appointments where you choose to share them.</li>
              <li>Authorised hospital staff can see safety flags so they can make sure you get help.</li>
            </ul>
          ),
        },
        {
          heading: "Services that process information for us",
          body: (
            <>
              <p>The portal uses these providers to work:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Cloud hosting and database services that store the portal's data.</li>
                <li>An email service and, where enabled, an SMS service, to send you one-time codes.</li>
                <li>Cloudinary, to store profile photos.</li>
                <li>Groq, an AI provider, to generate the AI assistant's replies. What you type in the chat is sent to it.</li>
              </ul>
            </>
          ),
        },
        {
          heading: "Keeping it secure",
          body: (
            <p>
              Passwords are stored only as secure hashes. Sign-in sessions expire, repeated failed attempts are limited,
              and medical record downloads are never stored in shared caches. Don't share your password or the codes we
              send you.
            </p>
          ),
        },
        {
          heading: "Your choices",
          body: (
            <p>
              You can change your password and profile photo in Account Settings. To correct your registration details,
              ask for a copy of your information, or raise a privacy concern, please{" "}
              <Link to="/contact" className="text-[#28574E] underline">contact the hospital</Link>.
            </p>
          ),
        },
      ]}
    />
  );
}
