# Patient flow fixes and doctor-portal prerequisites

Everything left unfinished in the patient flow before the doctor portal: two
account-takeover holes found along the way, the appointment rules, buttons
that did nothing, sign-in by role, linking doctor accounts, and the package
advisories. Branch `feature/patient-flow-fixes`, from `test`.

API details are in [api.md](../architecture/api.md). Earlier decisions are in
[patient-portal-tabs.md](./patient-portal-tabs.md).

## Contents

1. [Security fixes](#1-security-fixes-found-during-the-audit)
2. [Appointment rules](#2-appointment-rules)
3. [Buttons and pages that did nothing](#3-buttons-and-pages-that-did-nothing)
4. [Doctor-portal prerequisites](#4-doctor-portal-prerequisites)
5. [Package advisories](#5-package-advisories)
6. [How it was tested](#6-how-it-was-tested)
7. [Known limits and follow-ups](#7-known-limits-and-follow-ups)

## 1. Security fixes (found during the audit)

These weren't on the original list but were too serious to leave. Both
existed before the patient-portal work.

### Anyone could set any patient's password

`/setPassword` and `/resetPassword` found the account from an email address or
Patient ID in the request and set the password, with no proof the person had
verified the emailed code. With just an email address, an attacker could take
over the account and read its records and messages.

**Fix: one-time password tickets.**
- A correct activation or reset code returns a `passwordToken`: 32 random
  bytes, valid for 15 minutes, single use, and tied to its purpose (an
  activation ticket can't reset a password).
- Only its SHA-256 hash is stored on the user.
- The set and reset password endpoints now require the ticket and nothing
  else, so they no longer look anyone up by email.
- The client passes the ticket from the verify page to the password page in
  router state only. If the page is reloaded the ticket is gone and the patient
  is sent back to verify their code.

| Option | Trade-off |
| --- | --- |
| **Hashed, single-use ticket in the database (chosen)** | Can't be replayed. Revoked the moment it's used. A database leak doesn't expose usable tickets. |
| A signed JWT with a "set-password" purpose | No database write, but can't be made single-use without a denylist. |
| Ask for the code again on the password page | Works, but forces the code into two requests and keeps it valid longer. |

`/verifyRecoveryCode` now also requires the email. Matching a 6-digit code
across every account made guessing much easier.

### The activation step handed out admin tokens

`/verifyUser` issued a full login token whose role came from the request body
(`req.body.role || "user"`). Sending `role: "admin"` gave an admin token,
which could read every patient's safety flags. It also handed out a working
token before the emailed code was checked.

**Fix:**
- `/verifyUser` returns no token.
- No auth route accepts a role.
- `tokenFor()` no longer takes one; the role always comes from the stored
  account.

### Smaller hardening

- **401 vs 403.** Invalid or expired tokens are now **401**, not 403. The
  client signs people out only on 401, and never for `/api/auth/*`, where 401
  means a wrong password. That removes the "never return 403" workaround, so
  `requireRole` can return 403 and the doctor and admin portals can show "not
  allowed" without signing the user out.
- **Error responses.** The new error helper (`Utils/sendError.ts`) no longer
  sends internal error messages to the browser on 500s.
- **Client logging.** Auth pages no longer `console.log` responses that
  contained tokens.

## 2. Appointment rules

### Slots come from the server

**Before:**
- Each availability window (e.g. Monday 9:00 AM–1:00 PM) offered one slot,
  its start time, so a doctor could see one patient per window.
- The weekday was worked out in the browser's time zone, so it could be wrong
  for patients in other time zones.
- The server accepted any date and time.

**Now:**
- `GET /api/doctors/:id/slots?date=` splits the doctor's hours into
  `APPOINTMENT_SLOT_MINUTES` (30) slots in `HOSPITAL_TIMEZONE`
  (`Africa/Lagos`). Each slot is marked available, `booked` or `past`.
- Booking and rescheduling run the same checks before saving: the doctor is
  taking appointments, the date isn't past, the doctor works that weekday, the
  time is one of their slots, it hasn't started, and nobody else holds it.
- Errors name the field (`date`, `time`, `doctor`), so the screen can respond.

| Option | Trade-off |
| --- | --- |
| **Server computes slots; one `SlotPicker` uses them (chosen)** | One source of truth. The booking and reschedule screens can't disagree with what the server accepts, and the doctor portal can reuse the same endpoint. |
| Compute slots in the browser, validate on the server | Duplicated logic in two languages that can drift. The browser can't see other people's bookings anyway. |
| Store explicit slot documents | Needed for per-slot exceptions (leave, extra clinics). Overkill for weekly hours today. |

### No double-booking, even at the same instant

The service checks the slot first, so the patient gets a friendly message. A
unique partial index on confirmed `{ doctor, date, time }` is the final guard
when two bookings arrive at once. Only confirmed appointments hold a slot, so
cancelling frees it. In the browser, a "slot just taken" error sends the
patient back to the time step with fresh slots. That's tested by booking a
slot from another account while the first patient was mid-booking.

### Past appointments are completed

- **Status.** A new `completed` status. Confirmed appointments whose date has
  passed are marked completed whenever appointments are read
  (`completePastAppointments`). A scheduled job was rejected: it's more
  infrastructure, and reading appointments is the only time it matters. The
  doctor portal can add "mark completed" or "no-show" on top.
- **Upcoming.** "Upcoming" is decided by date as well as status, so last
  month's visit no longer shows as your next appointment.
- **Order.** Appointments are sorted by real time of day. String sorting had
  put "10:00 AM" before "9:00 AM".
- **Department.** The stored department is the doctor's own, so a booking
  can't be filed under the wrong one.

### Rescheduling and cancelling only open appointments

- Cancelled and completed appointments can't be rescheduled; before, that
  silently revived a cancelled one. They can't be cancelled either.
- The 7-day reschedule notice is enforced on the server as well
  (`RESCHEDULE_NOTICE_DAYS`). It was only in the browser before.
- The reschedule request body is validated.
- Rescheduling into the appointment's own current slot is allowed.

## 3. Buttons and pages that did nothing

| Item | Before | Now |
| --- | --- | --- |
| Notification bell | Decoration only | A panel showing unread doctor messages and recent appointment activity, refreshed every minute. A dot shows what's new since you last opened it, remembered per account in this browser. |
| Footer: Privacy, Terms, Contact | 404 page | Real pages. Privacy and Terms describe what the code actually does and make no legal promises; contact details come from `VITE_HOSPITAL_*` settings, not hard-coded. **Have the hospital's legal team review the wording.** |
| "Message" on appointment cards | No click handler | Opens that doctor's conversation |
| "Message Doctor" after booking or rescheduling | `console.log` / commented out | Opens that doctor's conversation |
| "Book Follow Up" / "View Summary" on completed visits | Did nothing / duplicated View | "Book Follow Up" opens booking; "Visit records" opens Medical Records |
| Cancel | Instant, no confirmation, errors swallowed | Confirmation dialog, then a toast with the result |
| Dashboard cancel | Refreshed a separate copy of the list, so the cancelled visit stayed | Refreshes the dashboard's own list |
| Dashboard loading state | Never shown (wrong prop name) | Shown |
| Doctor photos | Broken image (`/images/default-avatar.png` doesn't exist) | Initials fallback (`Avatar`) |
| Booking time slot | Couldn't change your mind after picking one | Can re-pick |
| Login errors | Always "Login failed" (read stale state) | The server's message, e.g. "Invalid Credentials" |
| Set or reset password | Saved the token behind AuthContext's back, so the user was bounced to login | Signs in through `login()` and lands on the right portal |
| Department details | Client called `/api/departments/:id`, server only had `/department/:id`; a bad ID crashed with a 500 | Both paths work; a bad ID is a 404 |
| Dates on cards and in the booking summary | `new Date("2026-10-02")` read as UTC, showing the wrong day in some time zones; Safari couldn't parse the booking summary date | Formatted from the date string directly |

## 4. Doctor-portal prerequisites

### Sign-in by role

- **Where people land.** `utils/roleHome.ts` maps each role to its home:
  patients to `/patientDashboard`, doctors to `/doctorDashboard`, admins to
  `/adminDashboard`. Login, set password and reset password all use it.
- **Route guard.** `ProtectRoute` takes `roles` and sends anyone else to their
  own portal. It also now redirects before rendering, instead of rendering the
  page and then redirecting.
- **Placeholders.** The doctor and admin routes show a simple "being built"
  page with Log out, so the whole sign-in → role → redirect chain works and is
  tested now.

| Option | Trade-off |
| --- | --- |
| **One role → home map plus `ProtectRoute roles` (chosen)** | One place to change when the portals arrive. |
| Separate login pages per role | More screens to keep in step; roles already come from the account. |

### Linking doctor accounts

A doctor has a public `Doctor` profile and a `User` login. Linking them sets
the login's role to `doctor` and `Doctor.userId`, which Messages, urgency
changes and the doctor portal need.

- **One service, two ways in** (`doctorAccountService`). Used by:
  - **admin endpoints**, `GET /api/admin/doctors` and
    `PUT`/`DELETE /api/admin/doctors/:id/account`, ready for the admin portal;
  - **`npm run link:doctor`**, for now, since there's no admin portal yet:
    `--list`, `--doctor "<name or id>" --account <UserId or email>`, `--unlink`.
- **Safety rules:**
  - one login per profile;
  - admin logins can't be linked;
  - relinking a profile returns the previous login to the patient role.
- **Logins aren't created here.** The hospital creates them like any account
  and the person activates it as usual. That keeps one onboarding path and
  avoids handling passwords in an admin tool.

## 5. Package advisories

`npm audit` reported 3 high-severity advisories. It now reports 0.

| Package | Advisory | Fix | Alternative considered |
| --- | --- | --- | --- |
| `cloudinary` 1.41 | Argument injection (fixed in 2.7) | Upgraded to **2.11** | Staying on v1: not acceptable for a production health app |
| `multer-storage-cloudinary` 4.0 | Pins Cloudinary v1; last released 2020 | **Removed.** Photos go through `multer.memoryStorage()` (still enforcing the 2 MB and image-only limits) and Cloudinary's own `upload_stream` (`config/Cloudinary.ts`) | A maintained fork: adds a dependency for about 15 lines of code |
| `nodemailer` 9.1 | Five advisories (TLS servername reuse, parser DoS) | Upgraded to **10.0.13**. The SMTP `createTransport` call used here is unchanged in v10 | Dropping SMTP and keeping Brevo only: the SMTP fallback is used when Brevo isn't configured |

## 6. How it was tested

- `npm run typecheck` and `npm run build` pass for every workspace. ESLint
  shows the same 2 errors as before: the `AuthContext` fast-refresh rule and an
  effect in `VerifyRecovery`, neither from this change.
- **50 new end-to-end API checks** against a throwaway MongoDB, all passing:
  - **password tickets:** an email alone is refused, made-up tickets are
    refused, tickets are single-use and purpose-bound, only the hash is
    stored, and recovery needs the email;
  - **roles and status codes:** the role in the request is ignored, an invalid
    token is 401, and a patient on an admin route is 403;
  - **slots:** generation, wrong weekday, and impossible dates;
  - **booking:** past dates, non-slot times, unavailable doctors, double
    booking, and two bookings at the same instant (exactly one wins);
  - **appointment lifecycle:** auto-complete, ordering, the 7-day rule, and
    rescheduling or cancelling completed and cancelled appointments;
  - **doctor linking:** link, sign in as doctor, the doctor sees their
    patients' conversations, duplicates refused, admins refused, and unlink.
- The earlier **34 portal checks** (records, messages, account, chat history)
  still pass after the package upgrades.
- **30 browser checks** in Chromium:
  - **sign-in and roles:** wrong password, role redirects, role guards, and
    refresh;
  - **bell and appointments:** the bell panel, the Completed tab, the cancel
    confirmation, and the 7-day message;
  - **booking:** booked slots disabled, re-picking a time, a slot taken
    mid-booking, then success and Message Doctor;
  - **info pages:** Privacy, Terms and Contact;
  - **activation end to end:** no token stored, code, set password, and
    signed straight in.
- `npm run link:doctor` was run against the test database.
- **Not tested:**
  - real Cloudinary uploads and real SMTP email, because no test credentials
    were used;
  - SMS delivery.

## 7. Known limits and follow-ups

- **Activation code guessing.** Codes are 6 digits and only IP rate-limited (20
  requests per 15 minutes). Add a per-account attempt limit on
  `verifyCode`/`verifyRecoveryCode`, like the login one.
- **Resend activation code sends a reset email.** "Resend code" on the
  activation page calls `/api/auth/codeReq`, the password-reset route. The
  code still works, but the patient gets a password-reset email. It needs an
  activation resend route; this page doesn't have the Patient ID and phone
  number that `/verifyUser` needs.
- **Wording that depends on settings.** The 7-day rule appears in the Terms
  page and the reschedule screen. Update them if `RESCHEDULE_NOTICE_DAYS`
  changes.
- **Completed vs no-show.** Appointments become `completed` by date. The
  doctor portal should let doctors mark no-shows or complete visits early.
- **Bell scope.** The bell shows appointment activity and unread messages.
  Notifications for new records, and email or push alerts, come with the
  doctor portal.
- **Role changes need a fresh sign-in.** Tokens last an hour, so a doctor
  linked or unlinked keeps their old role until then.
