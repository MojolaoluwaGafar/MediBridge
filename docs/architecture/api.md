# API contract

The API lives in `apps/Server` and is mounted under `/api`. The Client app reads the
server origin from `VITE_BASE_URL` and prefixes every request with `/api`.

Authenticated routes expect `Authorization: Bearer <token>`. Tokens are issued
by the auth routes and carry `{ id, role }`, where `role` is `user`, `doctor`,
or `admin`. The role always comes from the stored account, never from the
request. Tokens last one hour.

Status codes the client relies on:
- **401**: not signed in, or the token is invalid or expired. The client signs
  the user out (except on `/api/auth/*`, where 401 means a wrong password).
- **403**: signed in, but the role isn't allowed (`requireRole`). The client
  keeps the session.
- **400/404/409** errors from the newer routes look like
  `{ success: false, message, errors?: [{ field, message }] }`.

## Auth — `/api/auth`

| Method | Path                  | Auth | Purpose                                              |
| ------ | --------------------- | ---- | ---------------------------------------------------- |
| POST   | `/verifyUser`         | No   | Match Patient ID, email and registered phone (any format); send a 6-digit activation code by email and SMS |
| POST   | `/verifyCode`         | No   | Verify the activation code and activate the account. Returns a `passwordToken` |
| POST   | `/setPassword`        | No   | Body: `{ password, passwordToken }`. Set the first password; returns a login token |
| POST   | `/login`              | No   | Log in and receive a token                           |
| POST   | `/codeReq`            | No   | Request a password-reset code (email and SMS)        |
| POST   | `/verifyRecoveryCode` | No   | Body: `{ code, email }` (email required). Returns a `passwordToken` |
| POST   | `/resetPassword`      | No   | Body: `{ password, confirmPassword, passwordToken }`. Returns a login token |

**Password tickets.** Setting or resetting a password needs the
`passwordToken` returned by the matching verify step: a random, single-use
ticket valid for 15 minutes (only its SHA-256 hash is stored). Without it,
anyone who knew an email address or Patient ID could set the password.
`/verifyUser` no longer returns a token, and no auth route accepts a `role`.

Phone numbers and SMS delivery are described in [phone-verification.md](./phone-verification.md).

## Appointments

| Method | Path                            | Auth | Purpose                         |
| ------ | ------------------------------- | ---- | ------------------------------- |
| POST   | `/api/bookAppointment`          | Yes  | Book an appointment. Body: `{ doctor, department, date: "YYYY-MM-DD", time: "9:30 AM", reason, shareRecords? }` |
| GET    | `/api/appointments`             | Yes  | List the user's appointments    |
| PATCH  | `/api/appointment/:id/reschedule` | Yes | Body: `{ date, time }`. Only confirmed, upcoming appointments, at least `RESCHEDULE_NOTICE_DAYS` (7) days ahead |
| PATCH  | `/api/appointment/:id/cancel`   | Yes  | Cancel a confirmed, upcoming appointment |
| PATCH  | `/api/appointment/:id/urgency`  | Doctor | Change the urgency on one of the doctor's own appointments. Body: `{ level, reason? }` |

Appointment status is `pending`, `confirmed`, `completed` or `cancelled`.
Confirmed appointments whose date has passed are set to `completed` when
appointments are read (`completePastAppointments`). `GET /api/appointments`
returns them in date and time order.

**Slots and booking rules.** A doctor's weekly hours (`availableTime`) are split
into `APPOINTMENT_SLOT_MINUTES` (30) slots in the hospital's time zone
(`HOSPITAL_TIMEZONE`, default `Africa/Lagos`). Booking and rescheduling check,
in order: the doctor exists and is taking appointments; the date isn't in the
past; the doctor works that weekday; the time is one of their slots; it hasn't
already started; and nobody else holds it. A unique index on confirmed
`{ doctor, date, time }` stops two simultaneous bookings. A taken slot is a
409 with `errors: [{ field: "time" }]`. The stored department is the doctor's.

Booking runs safety triage on the reason for the visit and stores
`urgency: { level, reason, source, updatedAt }`, where `level` is `routine`,
`urgent` or `emergency`. When the level is `urgent` or `emergency`, the booking
response also has a `safetyMessage` to show the patient.

## Doctors, departments, activity, support

| Method | Path                  | Auth | Purpose                           |
| ------ | --------------------- | ---- | --------------------------------- |
| GET    | `/api/doctors`        | No   | List doctors                      |
| GET    | `/api/doctors/:id`    | No   | Get one doctor                    |
| GET    | `/api/doctors/:id/slots?date=YYYY-MM-DD[&appointmentId=]` | Yes | `{ date, day, slotMinutes, slots: [{ time, available, reason? }] }`. `reason` is `booked` or `past`. Pass `appointmentId` when rescheduling so its own slot counts as free |
| GET    | `/api/departments`    | No   | List departments                  |
| GET    | `/api/departments/:id` | No  | Get one department (the document itself). `/api/department/:id` still works |
| GET    | `/api/activities`     | Yes  | The user's recent activity        |
| POST   | `/api/aiChat`         | Optional | Send a message to the AI assistant. Body: `{ message, sessionId? }`. Returns `{ reply, sessionId, urgency }`. Rate limited. See [ai.md](./ai.md) |
| GET    | `/api/aiChat/sessions` | Patient, Doctor | The user's 20 most recent saved chats: `{ sessionId, title, updatedAt }[]`. Title is the start of the first message |
| GET    | `/api/aiChat/sessions/:sessionId` | Patient, Doctor | One saved chat: `{ sessionId, messages: { role, content, level, at }[] }`. 404 unless it belongs to the user, in the same role |

## Medical records

Records are written by the hospital. Patients can only read their own; there
is no patient create, update or delete. Until the doctor portal writes them,
`npm run seed:records -w @medibridge/server` creates development records from
existing appointments.

| Method | Path                   | Auth    | Purpose |
| ------ | ---------------------- | ------- | ------- |
| GET    | `/api/records`         | Patient | The patient's records, newest visit first, with `doctor` populated (`docName`, `docImg`, `department`) |
| GET    | `/api/records/:id`     | Patient | One record |
| GET    | `/api/records/:id/pdf` | Patient | The record as a generated PDF download. Sent with `Cache-Control: no-store` |

A record is `{ type, title, department, visitDate, summary?, sections: { heading, body }[], doctor?, appointment? }`.
`type` is `consultation`, `lab_result`, `prescription`, `imaging` or `discharge_summary`.

## Messages (patient and doctor)

A conversation is every message between one patient and one doctor. The same
routes serve both sides: `:otherId` is the doctor's profile ID when a patient
calls them, and the patient's user ID when a doctor does. A doctor login must
be linked to a doctor profile. People can only message someone they have (or
had) an appointment with. Anything not allowed answers 404, never 403, because
the client signs people out on 403.

| Method | Path                                   | Auth            | Purpose |
| ------ | -------------------------------------- | --------------- | ------- |
| GET    | `/api/conversations`                   | Patient, Doctor | One entry per contact: `{ contact: { id, name, image, subtitle }, lastMessage, unreadCount }`, most recent first |
| GET    | `/api/conversations/:otherId`          | Patient, Doctor | `{ contact, messages }`, the latest 100 messages oldest first. Marks the other side's messages as read |
| POST   | `/api/conversations/:otherId/messages` | Patient, Doctor | Body: `{ body }` (1–2000 characters). Returns `{ message, urgency, safetyMessage? }` |

Patients' messages go through the same safety triage as the AI chat. Urgent and
emergency messages create a flag with `source: "message"`, and the response
includes a `safetyMessage` to show the patient.

## Account

| Method | Path                    | Auth | Purpose |
| ------ | ----------------------- | ---- | ------- |
| GET    | `/api/account`          | Yes  | `{ profile: { id, userId, firstname, lastname, email, phone, role, img } }` |
| PATCH  | `/api/account/password` | Yes  | Body: `{ currentPassword, newPassword, confirmPassword }`. A wrong current password is a 400 with `errors[].field`. Limited to 5 attempts per account per 15 minutes |
| POST   | `/api/account/avatar`   | Yes  | Multipart field `photo`: JPG, PNG or WebP up to 2 MB, stored in Cloudinary cropped to 400×400. Returns the updated `profile` |
| DELETE | `/api/account/avatar`   | Yes  | Removes the profile photo |

Name, email, phone and Patient ID are read-only. Email and phone are used to
verify and recover the account, so changing them needs its own verified flow.
The login response now includes `user.img`.

## AI safety flags

| Method | Path                      | Auth          | Purpose |
| ------ | ------------------------- | ------------- | ------- |
| GET    | `/api/flags`              | Admin, Doctor | List flags, newest first. Filters: `?status=new\|reviewed`, `?level=urgent\|emergency`. Doctors only see their own patients' flags |
| PATCH  | `/api/flags/:id/review`   | Admin, Doctor | Mark a flag reviewed. Body: `{ note? }` |

## Doctor portal — `/api/doctor`

Doctor logins only (403 for anyone else). Each route also needs the login to
be linked to a doctor profile; an unlinked login gets 404 with a message the
portal shows. A doctor only ever sees their own appointments and the patients
who booked them; anything else is 404.

| Method | Path | Purpose |
| ------ | ---- | ------- |
| GET    | `/api/doctor/me` | The doctor's profile, weekly hours and `slotMinutes` |
| GET    | `/api/doctor/dashboard` | `stats`, today's `schedule`, `nextAppointmentId`, `needsAttention` (open safety flags) and `activity` |
| GET    | `/api/doctor/appointments?view=` | `view`: `upcoming` (default), `today`, `completed`, `cancelled`, `all`. Optional `date=YYYY-MM-DD`. Each has its `patient` |
| PATCH  | `/api/doctor/appointments/:id/complete` | Mark a confirmed visit completed, once its start time has passed |
| PATCH  | `/api/doctor/appointments/:id/cancel` | Body: `{ reason? }`. The patient gets a message from the doctor (with the reason) and an activity entry, and the slot frees up |
| GET    | `/api/doctor/patients` | Patients who booked with this doctor, with `visits`, `lastVisit`, `nextVisit` |
| GET    | `/api/doctor/patients/:id` | Profile: contact details, appointments with this doctor, `recordsShared`, `records` (summaries, only when shared) and the doctor's `notes` |
| GET    | `/api/doctor/patients/:id/records/:recordId` | One shared record with its sections |
| GET    | `/api/doctor/patients/:id/records/:recordId/pdf` | Shared record as a PDF (`Cache-Control: no-store`) |
| POST   | `/api/doctor/patients/:id/notes` | Body: `{ body, appointmentId? }`. A private note only this doctor sees |
| POST   | `/api/doctor/appointments/:id/records` | Write a record for a visit that has taken place. Body: `{ type: "consultation" | "prescription", title, summary?, sections: [{ heading, body }] }` (empty sections are dropped). The patient sees it immediately and gets a "record" activity |
| POST   | `/api/doctor/records/:id/addenda` | Body: `{ body }`. Records the doctor wrote can't be edited; this appends a dated "Addendum" section and tells the patient |
| PUT    | `/api/doctor/availability` | Body: `{ availability, availableTime: [{ day, start, end }] }`. Blocks on a day can't overlap and need at least one slot. Returns the profile and `outsideHours`: booked visits that no longer fit (they stay booked) |

Records are shared when the patient ticked "share records" on a booking with
this doctor that isn't cancelled. A doctor always sees the records they wrote
themselves. Doctors write consultation notes and prescriptions; lab results,
imaging and discharge summaries are uploaded by hospital staff (admin portal). The doctor also uses `/api/conversations`
(messages), `PATCH /api/appointment/:id/urgency` and `/api/flags`.

To try the portal locally: `npm run seed:demo-doctor -w @medibridge/server -- --yes`
creates a demo doctor (`DEMO-DOC-01`) with sample patients, visits, records,
messages and flags, all on `@demo.medibridge.test` addresses. It refuses to run
with `NODE_ENV=production`.

## Admin portal — `/api/admin`

Admin logins only. The portal is at `/adminDashboard`.

Nobody's password is set by an admin. Patients, doctor logins and admin
accounts are **pre-registered** (ID, name, email, phone), and each person
activates their own account on the Activate Account page: a code goes to their
email and phone, and they choose a password. IDs left empty are generated
(`P`, `D` or `A` plus six digits).

| Method | Path | Purpose |
| ------ | ---- | ------- |
| GET    | `/api/admin/overview` | Hospital-wide counts: patients (active / not activated), doctors (with login, taking bookings), departments (`unstaffed`: no doctor taking bookings), appointments, open safety flags, records this week |
| GET    | `/api/admin/patients?q=&page=` | Patients, 25 a page, newest first. `q` matches name, email or the start of the patient ID |
| POST   | `/api/admin/patients` | Register a patient. Body: `{ userId?, firstname, lastname, email, phone }`. 409 with `errors[0].field` when the ID, email or phone is taken |
| GET    | `/api/admin/patients/:id` | Patient, their appointments and records (`uploadedByStaff` marks removable uploads) |
| PATCH  | `/api/admin/patients/:id` | Correct name, email or phone (patients can't change these themselves) |
| POST   | `/api/admin/patients/:id/records` | Upload a document (multipart): `file` (PDF, JPG or PNG, max 10 MB, checked by content) plus `type` (`lab_result`, `imaging`, `discharge_summary`), `title`, `department`, `visitDate`, `summary?`. The patient is notified |
| GET    | `/api/admin/patients/:id/records/:recordId/file` | Download a record (the uploaded file, or a generated PDF) |
| DELETE | `/api/admin/records/:id` | Remove a staff upload (wrong patient or wrong file). Records doctors wrote can't be removed; they're corrected with an addendum. Logged for audit |
| GET    | `/api/admin/doctors` | Every doctor with hours, upcoming appointment count and linked login (`activated`) |
| POST   | `/api/admin/doctors` | Add a doctor profile. Body: `{ docName, department, YOE, gender, about?, availability?, availableTime? }` |
| PATCH  | `/api/admin/doctors/:id` | Edit the profile (name, department, taking bookings on or off) |
| PUT    | `/api/admin/doctors/:id/availability` | Weekly hours, same rules and `outsideHours` warning as `PUT /api/doctor/availability` |
| POST   | `/api/admin/doctors/:id/photo` | Profile photo (multipart `photo`, JPG/PNG/WebP, max 2 MB) |
| POST   | `/api/admin/doctors/:id/login` | Create the doctor's login (not yet activated) and link it. Body as for patients |
| PUT    | `/api/admin/doctors/:id/account` | Link an existing login. Body: `{ account }` (User ID or email). Sets its role to `doctor`; the previous login goes back to `user` |
| DELETE | `/api/admin/doctors/:id/account` | Unlink. The login goes back to the `user` role |
| GET    | `/api/admin/departments` | Departments with live `doctors` and `acceptingDoctors` counts |
| POST   | `/api/admin/departments` | Add one. Body: `{ field, category, summary, icon, overview, services[] }` |
| PATCH  | `/api/admin/departments/:id` | Edit. Renaming moves its doctors; past appointments and records keep the old name |
| GET / POST | `/api/admin/admins` | List or pre-register admin accounts |

Safety flags use `/api/flags` (above). Role changes take effect the next time
the person signs in. `npm run link:doctor` still works for linking from the
command line.

**Document storage.** Uploads go to Cloudinary as private ("authenticated")
files with no public URL; the API fetches each one with a one-minute signed
link and streams it only to people allowed to see the record.
`STORAGE_DRIVER=local` keeps files on disk instead (development and tests;
Render's disk is wiped on every deploy). Where a file is stored is never sent
to the browser.

## Not built yet

- Real-time message delivery. The portal checks for new messages every 10
  seconds while a conversation is open.
- Deleting patients, doctors or departments. Left out on purpose: their medical
  history must be kept. Turn off a doctor's bookings instead.

## Rate limits

Rate limiting uses [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit)
(`apps/Server/src/middlewares/RateLimiter.ts`). A client over a limit gets
`429` with `{ success: false, message }`, plus standard `RateLimit` and
`Retry-After` headers.

| Routes                 | Limit                      | Counted by            |
| ---------------------- | -------------------------- | --------------------- |
| `/api/*`               | 100 per minute             | IP                    |
| `/api/auth/*`          | 20 per 15 minutes          | IP                    |
| `POST /api/auth/login` | 5 **failed** logins per 15 minutes | User ID (any IP) |
| `POST /api/auth/verifyUser`, `/codeReq` | 5 code requests per 15 minutes | User ID or email (any IP) |
| `POST /api/aiChat`     | 10 per minute              | IP                    |
| `PATCH /api/account/password` | 5 per 15 minutes    | Account               |

Limits stack: a login request counts against all three login-related rows.
IPv6 clients are grouped by /56 block so rotating addresses does not bypass
limits. A patient locked out of login can still reset their password.

Counts are held in memory, which is correct for one server instance. Before
running several instances, give the limiters a shared store (for example
`rate-limit-redis`) in `baseOptions`.
