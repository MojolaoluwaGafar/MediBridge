# Patient portal: Medical Records, Messages, AI Support, Account Settings

This records the decisions made while finishing the patient portal (the four
new tabs, plus the responsive sidebar and Departments header). For each one:
what we chose, why, and what else we considered. The guiding rule was to pick
what is best for **readability**, **functionality** and **adaptability**
(how easily the code can grow, especially into the doctor and admin portals
that come next).

Design source: the `final design` page of the MediBridge Figma file
(`Medical page`, `Message Page`, `Ai Support Page`). There is no Figma frame
for Account Settings yet, so that page reuses the same cards, type sizes and
colours. Swap it for the real design when one exists.

---

## 1. Packages

### Added

| Package | Where | Why | Alternatives considered |
| ------- | ----- | --- | ----------------------- |
| `pdfkit` (+ `@types/pdfkit`, dev) | Server | Generates the "PDF" download for a medical record. Mature, no headless browser, streams straight into the HTTP response, and has a small API. The PDF code (`Services/recordPdf.ts`) knows nothing about Express or Mongoose, so the doctor portal or an email job can reuse it. | **jsPDF / @react-pdf/renderer (client)**: adds ~200–400 KB to every patient's bundle, and each browser would render slightly differently. **Puppeteer / Playwright (HTML→PDF)**: best-looking output, but ships a 100+ MB browser to Render and is slow to start. **`window.print()` with a print stylesheet**: no dependency, but opens the print dialog instead of downloading, and the result depends on the browser. |

That is the only new dependency.

### Reused instead of adding something new

| Need | Used | Not added, and why |
| ---- | ---- | ------------------ |
| Profile photo upload | `multer` + `multer-storage-cloudinary` + `cloudinary` (already installed, `config/Cloudinary.ts`) | **S3 / R2**: a new account and SDK for one feature. **GridFS**: puts images in the database and serves them through our API. Cloudinary also crops the photo to a 400×400 square around the face for free. |
| Forms and validation | `react-hook-form` + `zod` + `@hookform/resolvers` (already used on the auth pages) | **Formik / Yup**: a second form library would make the code harder to read. The same Zod rules run on the server. |
| Data fetching | The existing `useApiQuery` / `useApiMutation` hooks and axios services | **TanStack Query / SWR**: they would handle caching and polling well, but switching only these four pages would leave two patterns in the codebase. Worth a separate, codebase-wide PR later. |
| Live message updates | A small `usePolling` hook (no package) | **Socket.IO / WebSockets**: real-time, but needs a socket server, auth on the socket and sticky sessions on Render, and doctors can't reply until the doctor portal exists anyway. **Server-Sent Events**: lighter, still long-lived connections. Polling is enough for clinic messaging; the hook is the only thing to replace later. |
| Icons | `lucide-react` (already used, matches the Figma icons) | — |
| Tab routing | `react-router`'s `useSearchParams` (already installed) | **A state library (Zustand / Redux) or context**: more code to do what the URL does for free. |

---

## 2. Cross-cutting decisions

### The active tab lives in the URL (`/patientDashboard?tab=messages`)

- **Why:** refresh keeps you on the same tab, the browser back button works,
  and any page can link straight to a tab. For example, "Message Doctor" in
  the appointment modal opens `?tab=messages&contact=<doctorId>`, and Quick
  Actions open the AI Support and Medical Records tabs instead of other pages.
  `patientTabLink()` in `PatientTabs.tsx` builds these links, so there are no
  hand-written URLs.
- **Alternatives:** keep `useState` in `PatientPage` and pass setters down
  (deep prop drilling and lost on refresh), or a context (still lost on
  refresh, and no shareable links). Separate routes per tab
  (`/patientDashboard/messages`) would also work, but means restructuring
  `App.tsx` and the layout. That's a good move when the doctor portal adds its
  own routes; the query parameter is a smaller change now.

### Shared portal components in `Components/PortalComponents/`

`PageHeader`, `SearchFilterBar`, `EmptyState`, `Modal`, `Avatar`.

- **Why:** every new page has the same header, search/filter card and empty
  state. One component each keeps the pages short and identical. The doctor
  and admin portals will use the same pieces. The folder name matches the one
  already used on the doctor/admin branch, so the two can merge without
  renaming.
- **Alternative:** copy the markup into each page, as the older pages do. It's
  quicker to write, but the copies drift apart. Departments was moved onto
  `PageHeader` + `SearchFilterBar`, which is also what fixed its layout on
  phones.

### Each feature has the same layers

`types/<feature>.ts` → `API/services/<feature>Service.ts` →
`Hooks/<Feature>/use<Feature>.ts` → `Components/PatientPageComponents/<Feature>/`.

- **Why:** it's the pattern the codebase already uses for appointments and
  doctors. Components never call axios directly, so the doctor portal can
  reuse a hook (for example `useConversations`) with a different UI.

### Shared helpers

- `utils/formatDate.ts`: one place for "Thursday, July 2, 2026", "3:00 AM"
  and the message timestamp.
- `utils/apiError.ts`: turns a failed request into the server's message or a
  fallback.
- `utils/downloadBlob.ts`: saves a file fetched with the auth header.

### Status codes the client depends on

The axios interceptor signs the user out on **any** 401 or 403. So new
endpoints use 400 for "wrong current password" and 404 for "not your record or
conversation", never 401 or 403. This is written in `docs/architecture/api.md`.
- **Alternative:** change the interceptor to sign out only on 401 for an
  invalid token. That's better long-term, but it changes behaviour for every
  existing endpoint, so it should be its own PR.

---

## 3. Sidebar and Departments header (responsive)

**Problems found:**
- On phones the "Book New Appointment" button was absolutely positioned on top
  of the Departments title, and the search and filter were squashed into one
  row.
- The button had no `onClick`, so it did nothing on any screen.
- The phone menu had no close button and couldn't scroll.
- The closed menu's shadow showed as a grey strip along the left edge.
- On desktop the sidebar was only as tall as the page content, so "Log out"
  moved up and down between tabs.

**What changed:**
- **Departments:** title and button stack on phones (the button goes full
  width) and sit side by side from `sm` up. The search and filter stack on
  phones. The button now opens the same booking modal as the Dashboard.
- **Phone and tablet (below `lg`): slide-in drawer.**
  - It has the logo and a close (X) button.
  - It closes on Escape, on the backdrop, and after choosing a tab.
  - It scrolls if the screen is short.
  - It's `invisible` when closed, which removes the shadow strip and keeps
    hidden links out of keyboard tab order.
  - The menu button has `aria-expanded` and `aria-controls`.
- **Desktop (`lg` and up): a sticky column.** The top bar is a fixed 5rem and
  sticks to the top. The sidebar sticks under it at full height, so
  navigation and "Log out" stay in view while the page scrolls, as in the
  design.
- Icons are 20px and labels `text-sm`, to match the Figma sidebar.

**Alternatives:**
- An icon-only "rail" sidebar on tablets is compact, but the Figma design has
  no rail, and the labels matter to patients.
- A full app-shell layout, where only the main area scrolls, would avoid the
  fixed 5rem header height, but it would move the footer inside the scrolling
  area. The 5rem is commented in both `TopBar.tsx` and `SideBar.tsx`.

---

## 4. Medical Records

**Design:** the page header; a search + filter card; record cards (icon, title,
"Dr. … · … Department", date, **View** and **PDF** buttons); and the "No
Medical Records Yet" empty state.

| Decision | Why | Alternatives |
| -------- | --- | ------------ |
| **Records are written by the hospital**; patients only read them (`GET /api/records`, `/:id`, `/:id/pdf`) | The design says "hospital visits and consultation summaries", with a doctor on every card. These are clinical documents, not patient uploads. | Patient uploads (a different product: a personal health locker); both (add a `source` field later, and the model already has `createdBy`). |
| **One `MedicalRecord` model with a `type` and free-form `sections: [{heading, body}]`** | Consultation notes, lab results, prescriptions and so on all fit one shape. Doctors can structure notes ("Presenting complaint", "Plan") without schema changes, and the filter is just `type`. | A model per record type (rigid, five times the code); a single text field (no structure for the PDF or the view). |
| **Filter = record type** | The design has one "Filter: All" dropdown, and the search box already covers doctor, department and date. | Filter by department (duplicates search); by year. |
| **Search on the client** | A patient has tens of records, not thousands. Filtering instantly needs no extra endpoint. It matches title, doctor, department, type, the full date and "July 2026" / "Jul 2026", as the design's placeholder suggests. | Server-side `?q=` search, worth adding with pagination if lists grow. |
| **"View" opens a modal** with the doctor, type, date, summary and sections | Keeps the patient on the list; uses the shared `Modal` (Escape to close, bottom sheet on phones). | A separate detail page or route (more navigation for a short document). |
| **PDF made on the server** (pdfkit), fetched as a blob | The client can't put the auth token on a plain link, so it downloads with axios and saves the file. `Cache-Control: no-store` keeps medical PDFs out of caches. | See Packages. |
| **Sample data via `npm run seed:records -w @medibridge/server -- <PatientId>`** | There's no doctor UI to write records yet; this makes the page testable now. | Hard-coded mock data in the client (would ship to production). |
| Records shared with doctors are **not** exposed yet | Appointments already have `shareRecords`. The doctor-side endpoint belongs with the doctor portal, where its rules (which appointment, for how long) get decided. | Expose now (risky without the doctor-side rules). |

---

## 5. Messages (patient ↔ doctor)

**Design:** a conversation list with search, avatar, name, preview and time; a
thread with the doctor's name; green bubbles for the patient and mint bubbles
for the doctor, each with a time; and a "Type your Message..." box.

| Decision | Why | Alternatives |
| -------- | --- | ------------ |
| **One `Message` model keyed by `(patient, doctor)`**; no separate thread document | A conversation is simply "all messages between these two", so there's nothing to keep in sync. One index serves both the list and the thread. | A `Conversation` document holding the last message and unread counts: faster for huge inboxes, but every send must update two documents. Worth it only at scale. |
| **Contacts = doctors the patient has (or had) an appointment with**, plus anyone already messaged | The design has no "new message" picker, and it stops patients messaging arbitrary doctors. Every booked doctor appears in the list ready to message. | A "New message" button with a doctor search (not in the design, and allows unsolicited messages); one thread per appointment (clutters the list with the same doctor). |
| **One set of endpoints for both roles** (`/api/conversations`, `/:otherId`, `/:otherId/messages`) | The controller works out "who am I" from the token. The doctor portal just builds a UI on the same API. | Separate `/patient/...` and `/doctor/...` routes (duplicate logic). |
| **Polling** (thread every 10 s, list every 30 s, paused while the browser tab is hidden) | No new infrastructure; see Packages. Hidden-tab pausing keeps the load low. | WebSockets or SSE later; only `usePolling` changes. |
| **Opening a thread marks it read on the server**; the list shows unread badges | The simplest correct read state. The list clears the badge locally so it updates at once. | Read receipts per message, or an explicit "mark read" call (more requests, same result). |
| **Patient messages go through safety triage** (the same `triage()` as chat and booking). Urgent and emergency messages are flagged (`source: "message"`), and the patient is shown where to get help now | A doctor may not read a message for hours. "I want to end my life" sent to a doctor's inbox must not wait silently. Flags show up in the existing flag review for that patient's doctors and for admins. | Skip triage (unsafe); block the message (the patient still needs to reach their doctor). |
| **Phones show the list or the thread** (with a back arrow and real history, so the browser back button works); **tablet and desktop show both** | Two panes don't fit at 375px. On wide screens the most recent conversation opens automatically, as in the design. | Always two panes (unusable on phones). |
| The open conversation is in the URL (`&contact=`) | Deep links from the appointment modal, refresh, and back. | Component state (lost on refresh). |

---

## 6. AI Support

**Design:** a "MediBridge AI" card with a **New Chat** button, chat bubbles,
suggestion chips, a "Type your question..." box and the disclaimer.

| Decision | Why | Alternatives |
| -------- | --- | ------------ |
| **Reuse `useAI` and `AiChatBubble`** from the public Support page | One chat implementation. The portal and public chat stay consistent, and fixes reach both. | A separate portal chat (duplication). |
| **Reopen the latest conversation** (`GET /api/aiChat/latest`) | The server already stores signed-in users' sessions. Losing the conversation on refresh felt broken. Server-side "latest" works across devices, unlike `localStorage`. | Store `sessionId` in `localStorage` (per device, and left behind after logout); a full history sidebar (not in the design; can be added on the same data). |
| **"New Chat" starts a fresh session** by dropping the `sessionId` | The next message creates a new session, which becomes the latest. No delete endpoint needed, and nothing is lost. | Delete the old session (destroys history the safety flags link to). |
| **Urgent and emergency replies show a coloured notice** in the bubble | Triage already returned `urgency`, but nothing displayed it. A safety signal should be visible, so this applies to the public Support page too. | Leave it to the reply text alone. |
| Suggestion chips send immediately | One tap, as in the design. | Fill the input first (the older Support page does this). |

---

## 7. Account Settings (no Figma frame yet)

**Contents:** a profile photo card (upload, change, remove); personal details
(name, email and Patient ID read-only, phone editable); and change password.

| Decision | Why | Alternatives |
| -------- | --- | ------------ |
| **Only the phone number is self-service** | Name, email, Patient ID and registered number identify the patient to the hospital, and account activation and recovery match on them. Letting patients edit them would break those flows. | Editable email with a verification code: a good follow-up, built on the existing code-email flow. |
| **Change password needs the current password**; min 8 characters; must differ from the old one | Stops someone with an unlocked session taking over the account. Same rule on client and server. A wrong current password shows on that field (400, not 401; see section 2). | Send a reset email instead (slower for the patient). |
| **Photos are stored on Cloudinary** (JPG, PNG or WebP, max 2 MB, cropped to 400×400). The old photo is deleted on change | Small, fast avatars. Checked in the browser first (instant error) and enforced again on the server. Raw upload errors are logged, never shown. | See Packages. Avatars are public URLs, which is fine for a profile picture but **not** for medical files (records don't use Cloudinary). |
| **The photo updates the whole portal at once** | `AuthContext.updateUser()` updates the stored user, so the top bar avatar changes immediately. Login now returns `img` too. | Re-fetch the user on every page. |

---

## 8. Bugs fixed along the way

- **Refreshing `/patientDashboard` sent signed-in users to the login page.**
  `AuthProvider` loaded the saved user in an effect, after `ProtectRoute` had
  already redirected. It now reads `localStorage` before the first render.
- **"Message Doctor"** in the appointment modal and the dashboard's **"Chat With
  AI" and "Medical Records"** quick actions went to other pages; they now open
  the matching portal tab.
- **Unhandled "Request already in progress" errors** from `useApiQuery` under
  React StrictMode (the error is already kept in state; the duplicate
  rejection is now caught).

---

## 9. Known gaps and next steps

- **Doctor side:** the reply UI for messages, writing medical records, and
  viewing records a patient shared (`shareRecords`). The APIs for messaging
  already work for doctors.
- **Notifications:** the bell in the top bar is still static. Unread message
  counts from `/api/conversations` are the obvious first source.
- **Real-time:** replace `usePolling` with SSE or WebSockets if message volume
  grows.
- **Data retention:** messages, like chat sessions and flags, contain health
  information. Agree a retention period before launch.
- **Lint:** `npm run lint` reports errors in files this work didn't touch
  (auth pages, `TopBar`'s search sync, `AuthContext`'s hook export). CI runs
  typecheck and build only.
- **Testing:** this environment couldn't reach a MongoDB server. The new pages
  were checked in a browser against a mocked API at 375, 768 and 1440px
  (navigation, sending, PDF download, validation, deep links, back button).
  The server was checked for auth, role and validation responses without a
  database. Run the four tabs once against a real database (after
  `seed:records`) before merging.
