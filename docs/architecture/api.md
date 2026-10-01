# API contract

The API lives in `apps/Server` and is mounted under `/api`. The Client app reads the
server origin from `VITE_BASE_URL` and prefixes every request with `/api`.

Authenticated routes expect `Authorization: Bearer <token>`. Tokens are issued
by the auth routes and carry `{ id, role }`, where `role` is `user`, `doctor`,
or `admin`.

## Auth — `/api/auth`

| Method | Path                  | Auth | Purpose                                              |
| ------ | --------------------- | ---- | ---------------------------------------------------- |
| POST   | `/verifyUser`         | No   | Match Patient ID, email and registered phone (any format); send a 6-digit activation code by email and SMS |
| POST   | `/verifyCode`         | No   | Verify the activation code                           |
| POST   | `/setPassword`        | No   | Set the password and activate the account            |
| POST   | `/login`              | No   | Log in and receive a token                           |
| POST   | `/codeReq`            | No   | Request a password-reset code (email and SMS)        |
| POST   | `/verifyRecoveryCode` | No   | Verify the password-reset code                       |
| POST   | `/resetPassword`      | No   | Set a new password                                   |

Phone numbers and SMS delivery are described in [phone-verification.md](./phone-verification.md).

## Appointments

| Method | Path                            | Auth | Purpose                         |
| ------ | ------------------------------- | ---- | ------------------------------- |
| POST   | `/api/bookAppointment`          | Yes  | Book an appointment             |
| GET    | `/api/appointments`             | Yes  | List the user's appointments    |
| PATCH  | `/api/appointment/:id/reschedule` | Yes | Reschedule an appointment      |
| PATCH  | `/api/appointment/:id/cancel`   | Yes  | Cancel an appointment           |
| PATCH  | `/api/appointment/:id/urgency`  | Doctor | Change the urgency on one of the doctor's own appointments. Body: `{ level, reason? }` |

Appointment status is `pending`, `confirmed`, or `cancelled`.

Booking runs safety triage on the reason for the visit and stores
`urgency: { level, reason, source, updatedAt }`, where `level` is `routine`,
`urgent` or `emergency`. When the level is `urgent` or `emergency`, the booking
response also has a `safetyMessage` to show the patient.

## Doctors, departments, activity, support

| Method | Path                  | Auth | Purpose                           |
| ------ | --------------------- | ---- | --------------------------------- |
| GET    | `/api/doctors`        | No   | List doctors                      |
| GET    | `/api/doctors/:id`    | No   | Get one doctor                    |
| GET    | `/api/departments`    | No   | List departments                  |
| GET    | `/api/department/:id` | No   | Get one department                |
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

## Not built yet

- Doctor and admin portals. Role checks exist (`requireRole`), but doctor
  accounts must be linked to a doctor profile (`Doctor.userId`) by hand for now.
- A `completed` appointment status, and endpoints for doctors to write medical
  records and visit notes.
- Real-time message delivery. The portal checks for new messages every 10
  seconds while a conversation is open.
- Admin create, update and delete endpoints for doctors, patients and
  departments.

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
| `/api/aiChat`          | 10 per minute              | IP                    |

Limits stack: a login request counts against all three login-related rows.
IPv6 clients are grouped by /56 block so rotating addresses does not bypass
limits. A patient locked out of login can still reset their password.

Counts are held in memory, which is correct for one server instance. Before
running several instances, give the limiters a shared store (for example
`rate-limit-redis`) in `baseOptions`.
