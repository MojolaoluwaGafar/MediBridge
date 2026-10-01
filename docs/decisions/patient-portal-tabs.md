# Patient portal: Medical Records, Messages, AI Support and Account Settings

This records what was built to finish the patient portal before the doctor and
admin portals, which options were considered, and why each one was chosen. The
guiding rule for every choice was: readable code, working features, and room
for the codebase to grow (the doctor and admin portals come next).

API details are in [api.md](../architecture/api.md). The Figma screens are in
the `final design` page of the MediBridge Figma file.

## Contents

1. [Where the work lives](#1-where-the-work-lives)
2. [Decisions that affect the whole portal](#2-decisions-that-affect-the-whole-portal)
3. [Responsive sidebar and Departments button](#3-responsive-sidebar-and-departments-button)
4. [Medical Records](#4-medical-records)
5. [Messages](#5-messages)
6. [AI Support](#6-ai-support)
7. [Account Settings](#7-account-settings)
8. [Packages](#8-packages)
9. [Where the build differs from Figma](#9-where-the-build-differs-from-figma)
10. [How it was tested](#10-how-it-was-tested)
11. [Known limits and follow-ups](#11-known-limits-and-follow-ups)

## 1. Where the work lives

Two branches, stacked on `test` as `CONTRIBUTING.md` asks:

```text
test ── feature/local-refactor ── feature/patient-portal-tabs
        (service layer, phone       (this work)
         verification, logging)
```

The local checkout was 6 commits behind GitHub (no AI triage, no saved chats),
and had a large uncommitted refactor on top. To build on both:

1. **Backed up the uncommitted refactor** as a commit on `backup/local-refactor`,
   exactly as it was, so nothing could be lost.
2. **Updated `main`** to match `origin/main`.
3. **Re-applied the refactor on `test`** as `feature/local-refactor`, resolving
   its conflicts with the triage work from #1:
   - booking triage, flagging and the doctor urgency change moved into
     `Services/appointmentService.ts`, so the controller stays thin like the
     rest of the refactor;
   - `Services/ai.ts` keeps `chatWithAI` from `test` and logs with pino;
   - `index.ts` keeps `FlagRoutes` next to the new logger and rate limiters;
   - `chatController.ts` stays deleted (`SupportController` replaced it).
4. **Put this work on top** and adapted it to the refactor's conventions (see
   [Server structure](#server-structure-follows-the-service-layer)).

| Option | Why not / why |
| --- | --- |
| **Two stacked branches (chosen)** | Each branch is one reviewable change: the refactor can be reviewed and merged first, then this. The portal code uses the service layer instead of being rewritten later. |
| One branch with everything | A PR too large to review in one sitting, mixing unrelated work. |
| Portal on `test` only, refactor merged later | The portal would follow the old controller style and need reworking once the refactor lands. |

### Server structure follows the service layer

- Database work lives in services that throw `ServiceError(status, message,
  field?)`. Controllers only parse the request and shape the response:
  - `recordService`
  - `conversationService` (messages)
  - `accountService`
  - `chatHistoryService`
- `ServiceError` gained an optional `field`. Older callers are unaffected; the
  password form uses it to show "current password is incorrect" next to the
  right input.
- `Utils/sendError.ts` gives the new routes one error shape:
  `{ success: false, message, errors? }`. Unexpected errors are logged with
  `req.log` and return a plain 500, without internal messages.
- **Rate limits:**
  - the password-change limit lives in `middlewares/RateLimiter.ts` with the
    others, using the same logging and response settings;
  - the per-IP AI limiter now applies only to `POST /api/aiChat`, so opening
    saved chats doesn't use up the AI allowance.
- **Logging:** all new code logs through pino. The last `console.error` (in
  `triage.ts`) was switched too.
- **Seeds:** `seed:records` respects `DB_NAME`, like `seed:patient`.

## 2. Decisions that affect the whole portal

### The open tab lives in the URL

`/patientDashboard?tab=messages&doctor=<id>`, through `Hooks/Portal/usePatientTab.ts`.

| Option | Trade-off |
| --- | --- |
| **URL search params (chosen)** | A refresh keeps the page. The back button works. Any component can send the patient to another tab (`goToTab("messages", { doctor })`) without passing callbacks through three levels of props. Links can be shared or bookmarked. |
| `useState` in `PatientPage` (before) | Every refresh went back to Dashboard, and "Message Doctor" in a modal had no way to switch tabs. |
| Nested routes (`/patientDashboard/messages/:doctorId`) | Also good, but needs `App.tsx` changes and a layout route. Search params give the same benefits with less churn. Worth revisiting if the portal gets many more screens. |
| React context for the tab | Fixes prop drilling but not refresh or back-button behaviour. |

### Shared portal components in `Components/PortalComponents/`

`PageHeader`, `EmptyState`, `Avatar`, `ChatInput` and `SafetyNotice`. The
doctor and admin portals will need the same pieces. The folder name matches
the one the open doctor-portal branch (`claude/busy-knuth-er813w`) already
uses, so the two merge cleanly.

### Small fixes to shared code

| Change | Why |
| --- | --- |
| `AuthContext` reads the saved session synchronously | It loaded in an effect, so the first render had no user and `ProtectRoute` redirected to `/login` on every refresh. Added `updateUser()` so a new profile photo shows in the header straight away. |
| `useApiQuery` catches its own auto-fetch rejection | Under React StrictMode the effect runs twice; the second call rejected with "Request already in progress", which surfaced as an uncaught error. The error is already stored in the hook's state. |
| Booking steps no longer fetch doctors twice | `StepOne` and `StepTwo` called `fetchDoctors()` on mount although `useDoctors` already fetches, causing the same error. |
| `Button` has `size="sm"` and `ariaLabel` | The Figma cards use compact 40px buttons. A size option keeps one button component instead of fighting its fixed 52px height with class overrides. |
| `utils/formatDate.ts` | One place for date formats, so every screen shows dates the same way. |

### Errors that mean "not allowed" are 404, never 403

The axios interceptor in `API/index.ts` signs the user out on any 401 or 403.
New endpoints answer 404 for things that exist but aren't yours, and 400 for a
wrong current password. This matches how `SupportController` already works.

## 3. Responsive sidebar and Departments button

**Sidebar**
- **Phones and tablets:** a slide-in drawer, as before, now with:
  - a logo and close button;
  - Escape to close;
  - no page scrolling behind it;
  - `aria-expanded`, `aria-controls` and `aria-current`.
- **Bug fixed:** its shadow used to show at the screen edge while it was closed.
- **Desktop:** it sticks under the 80px top bar and fills the screen height, so
  Log out stays visible on long pages. The border sits on an outer column so it
  runs the full page height.
- **Alternative:** a full app shell where only `<main>` scrolls. Rejected
  because it would move the footer inside the content column, and phones
  behave better with normal page scrolling.

**Departments "Book New Appointment"**
- **Before:** the button was `absolute right-0 top-0` and covered the heading on
  phones, and it did nothing when tapped.
- **Now:** it sits in the shared `PageHeader`: full width under the title on
  phones, beside it from `sm` up. It opens the existing booking modal.
- **Search and filter card:** stacks on phones instead of squeezing into a
  fixed 106px height.
- **Also fixed:** `DisplayDept` reset its page by calling `setState` inside
  `useMemo`, which React's lint flags as an infinite-loop risk. The page number
  is now stored together with the filters it belongs to.

## 4. Medical Records

**Who writes records: the hospital only.** Patients read and download their
own records and cannot create or change them.

| Option | Trade-off |
| --- | --- |
| **Clinician-issued, patient read-only (chosen)** | Matches the Figma screen ("history of hospital visits and consultation summaries") and clinical reality. Nothing a patient uploads can be mistaken for a clinical record. |
| Patient uploads | Works before the doctor portal exists, but brings file-storage privacy risk (see below) and mixes patient documents with clinical ones. Can be added later as a separate `source`. |
| Both, labelled | Best long term. The model has `createdBy` and `type`, so patient uploads can be added later without a migration. |

**Data model (`Models/MedicalRecord.ts`):** `type`, `title`, `department`,
`visitDate`, `summary` and `sections: { heading, body }[]`, linked to the
patient, the doctor and (optionally) the appointment.
- Headed sections let each record type have its own structure ("Presenting
  complaint", "Plan", "Results"…) without schema changes.
- A strict schema per record type was rejected for now. It is better for
  reporting, but premature before the doctor portal decides what doctors write.

**PDF download: generated on the server, on request, with `pdfkit`.**

| Option | Trade-off |
| --- | --- |
| **Generate on request on the server (chosen)** | No file is ever stored, so there is nothing to leak from storage. The PDF always matches the current record, and the layout lives in one tested place (`Services/recordPdf.ts`). Sent with `Cache-Control: no-store` and fetched with the auth header, never as a shareable link. |
| Generate in the browser (jsPDF) | Ships a large library to every patient, and the layout would be duplicated if the doctor portal or email ever needs the same PDF. |
| Headless Chrome (Puppeteer) | Pixel-perfect HTML-to-PDF, but a ~170 MB Chromium on Render and slow cold starts. |
| Store uploaded PDFs in Cloudinary | The existing Cloudinary setup uploads public files. Medical documents must not sit at public URLs. |

**Seed data:** `npm run seed:records -w @medibridge/server` creates one
consultation note per existing appointment. Re-running it skips appointments
that already have one. Development only, until doctors can write records.

## 5. Messages

**Data model:** one `Message` per message, keyed by the (patient, doctor) pair,
with `sender` and `readAt`.

| Option | Trade-off |
| --- | --- |
| **Messages keyed by patient and doctor (chosen)** | Simple. The conversation list is one aggregate query, with an index on `{ patient, doctor, createdAt }`. |
| A `Conversation` document plus messages | Useful for group chats or care-team threads. A separate `Conversation` model can be added later if needed. |
| Conversations per appointment | Clearer for "about my 10:30 visit", but a patient ends up with several threads with the same doctor. |

**Who can message whom:** a patient can message a doctor they have (or had) an
appointment with, which matches the "Message Doctor" button on an appointment.
This blocks unsolicited messages to any doctor in the hospital.

**One API for both sides:** the controller works out who is asking (patient by
user ID, doctor by linked doctor profile). The doctor portal can use the same
three routes without new endpoints.

**Delivery: polling.**
- The open conversation checks every 10 seconds and the list every 30, only
  while the browser tab is visible (`Hooks/Portal/usePolling.ts`).
- WebSockets (Socket.IO) were rejected for now. They need a socket server,
  auth on the socket, sticky sessions to scale, and CORS on Render. That isn't
  worth it while only the patient side exists.
- Revisit when the doctor portal ships. The hook is the only place that would
  change.

**Safety:**
- Patients' messages go through the same triage as the AI chat and bookings,
  because a doctor may not read a message for hours.
- Urgent and emergency messages create a flag (`source: "message"`). The
  patient sees a red or amber notice telling them where to get help now.
- Self-harm messages get their own wording, which points to a crisis line.

**Layout:**
- **Desktop:** the list and the conversation side by side, as in Figma, and the
  most recent conversation opens automatically.
- **Phones:** one panel at a time, with a back button. The open doctor is in
  the URL, so the phone's back button works too.

## 6. AI Support

The server already saved every chat in `ChatSession`. Two small read-only
endpoints let patients see that history again: list chats, and reopen one.

| Option | Trade-off |
| --- | --- |
| **Reuse the existing AI chat plus a history menu (chosen)** | Small change. Matches Figma (one chat card with "New Chat") and adds a compact "Recent chats" menu. |
| Reuse the public Support page component unchanged | Fastest, but chats would vanish on every tab switch and urgent replies wouldn't be shown differently. |
| A full chat sidebar like ChatGPT | Not in the design, and it costs a third of the width on tablets. |
| Streaming replies | Nicer feel, but it touches the AI service, triage and the rate limiter. Left for later. |

- The open chat is in the URL (`&chat=<sessionId>`), so a refresh reopens it.
- Emergency replies are shown as a red notice instead of a normal bubble.
  Urgent replies get an amber "if it gets worse" note.
- The footer says chats are saved to the patient's account. The public Support
  page's "not stored to your record" wording is untouched, because visitor
  chats are stored without a user ID.

## 7. Account Settings

There is no Account Settings frame in Figma, so this screen follows the same
cards, type and colours as the other portal screens.

**Read-only:** name, Patient ID, email and phone number.
- The hospital registers these details.
- Email and phone are how the account is activated and recovered, and the
  phone is becoming the SMS verification channel.
- Letting a signed-in session change them without verification would let
  anyone holding a stolen session take over password recovery.
- A verified change flow (a code sent to the old and new address) is the right
  way to add this later.

**Change password:**
- Needs the current password, at least 8 characters, and a different new one.
- Checked by the same rules on the client (zod) and the server.
- Limited to 5 attempts per account per 15 minutes with `express-rate-limit`,
  so a stolen session can't be used to guess the password.

**Profile photo:**
- JPG, PNG or WebP up to 2 MB, checked in the browser first and enforced on the
  server.
- Stored in Cloudinary and cropped to 400×400, centred on the face. The old
  photo is deleted when it is replaced.
- The header avatar updates at once.

## 8. Packages

Only one new package was added: `pdfkit`, plus its types. Everything else uses
libraries already in the repo, chosen on the same principle: for anything
security-sensitive, use a maintained, widely used library rather than custom
code.

| Need | Used | Why | Alternatives considered |
| --- | --- | --- | --- |
| Record PDFs (server) | **`pdfkit`** (new) + `@types/pdfkit` | Small and pure JavaScript, so it runs on Render with nothing extra. Streams straight into the HTTP response. Mature and widely used. | `pdf-lib` (better at editing existing PDFs, clumsier text layout); `puppeteer` (needs Chromium); `jsPDF` in the browser (large bundle, layout duplicated); `@react-pdf/renderer` (React on the server, heavier) |
| Photo upload | `multer` + `multer-storage-cloudinary` + `cloudinary` (existing) | Already configured in `config/Cloudinary.ts`. Multer enforces the size and type limits before anything is stored. | `multer.memoryStorage()` plus `cloudinary.uploader.upload_stream`, which drops the old adapter (see follow-ups); `busboy` directly (lower level); S3 or R2 pre-signed uploads (new account) |
| Rate limiting | `express-rate-limit` (existing) | Already used for the AI chat and the refactor's auth limits. Supports per-account keys. | A hand-written limiter (rejected for production); `rate-limiter-flexible` (more features, unnecessary today) |
| Logging | `pino` + `pino-http` (from the refactor) | Structured logs with tokens redacted. `req.log` ties each log line to its request. | `console` (no levels, no redaction); `winston` (heavier, a second logging style) |
| Validation | `zod` on both sides, `react-hook-form` + `@hookform/resolvers` on the client (existing) | Same libraries as the auth forms, so the code reads the same everywhere. | `yup`, `joi` (a second validation library for no gain); hand-written checks |
| Passwords | `bcrypt` (existing) | Already used for login and reset, cost factor 12. | `argon2` (stronger, but switching affects every existing hash) |
| Data fetching | Existing `useApiQuery` / `useApiMutation` + `axios` | Consistent with the rest of the client. Polling is a 20-line hook. | TanStack Query (better caching and polling, but a second data-fetching style beside the existing one; worth considering for the doctor portal) |
| Real-time | None (polling) | See [Messages](#5-messages). | `socket.io`, Server-Sent Events, Pusher or Ably (hosted, paid) |
| Icons | `lucide-react` (existing) | The Figma screens use Lucide icons. | — |
| Routing state | `react-router` `useSearchParams` (existing) | See [the URL decision](#the-open-tab-lives-in-the-url). | Nested routes, context |
| Dates | Built-in `Intl` / `toLocaleDateString` | Covers every format needed without a new package. | `date-fns`, `dayjs` (worth adding if time zones or relative times grow) |

## 9. Where the build differs from Figma

- **Account Settings:** no Figma frame exists. Built in the portal style.
- **AI Support:** adds a "Recent chats" button next to "New Chat", and red or
  amber safety notices. The footer line also says chats are saved.
- **Messages:** doctors without a photo show initials instead of a picture. On
  phones, the list and the conversation are separate screens.
- **Medical Records:** the filter lists record types. Figma shows "All" with no
  other options visible.
- **Figma access:** the Figma connector hit the Starter plan's tool limit, so
  the four screens were built from screenshots, not exact Figma values.
  Spacing and colours match the existing portal code, so they may be a few
  pixels off the frames.

## 10. How it was tested

- `npm run typecheck` and `npm run build` pass for every workspace. ESLint is
  clean on all new and changed client files except one existing rule in
  `AuthContext.tsx`: it exports `useAuthContext` alongside the provider,
  which React Fast Refresh warns about. That was already the case and is left
  for a separate cleanup.
- An end-to-end run against a throwaway MongoDB passed 34 API checks:
  - records: listing, one record, PDF download, someone else's record (404),
    bad ID (400);
  - messages: listing, unread counts, marking read, sending, emergency triage
    and the flag it creates, empty and too-long messages, messaging a doctor
    with no appointment (404);
  - account: profile without the password hash, wrong, mismatched and short
    passwords, a successful change and logging in with the new password,
    photo validation;
  - AI chat: listing and reopening saved chats, an unknown chat (404);
  - every new route returns 401 without a token.
- The rate limit was confirmed to return 429 after 5 password attempts.
- Click-through tests in Chromium at 375px and 1280px wide:
  - refresh keeps the tab;
  - the record modal opens, the PDF downloads, Escape closes the modal;
  - search by month and doctor works;
  - sending a message shows the safety notice;
  - phone back navigation works in Messages;
  - a wrong password shows next to the field without signing out;
  - the Departments booking button opens the booking modal;
  - top-bar search jumps to Departments;
  - saved AI chats reopen and survive a refresh;
  - New Chat clears the conversation.
- Screenshots at 375, 768 and 1280px, with no horizontal scrolling.
- **Not covered:**
  - real AI replies, because no Groq key was used (the 502 path was tested);
  - real Cloudinary uploads, because there were no credentials (only the
    validation paths were tested).

## 11. Known limits and follow-ups

- **Rate-limit counts are kept in memory.** That is fine for one server.
  Before running more than one, add a shared store such as `rate-limit-redis`.
- **`multer-storage-cloudinary` is old.** It was last released in 2020 and pins
  Cloudinary v1. Replacing it with `memoryStorage` plus
  `cloudinary.uploader.upload_stream` removes that dependency.
- **Profile photos are at unguessable but public Cloudinary URLs.**
  Acceptable for an avatar. Use Cloudinary's `authenticated` delivery type
  if the hospital treats photos as sensitive.
- **The doctor portal needs:**
  - endpoints to write records;
  - the doctor side of Messages (same routes);
  - showing records to doctors when the patient chose `shareRecords`.
- **Doctor accounts must be linked to a doctor profile** (`Doctor.userId`)
  before doctors can use Messages.
