# API contract

The API lives in `apps/Server` and is mounted under `/api`. The Client app reads the
server origin from `VITE_BASE_URL` and prefixes every request with `/api`.

Authenticated routes expect `Authorization: Bearer <token>`. Tokens are issued
by the auth routes and carry `{ id, role }`, where `role` is `user`, `doctor`,
or `admin`.

## Auth — `/api/auth`

| Method | Path                  | Auth | Purpose                                              |
| ------ | --------------------- | ---- | ---------------------------------------------------- |
| POST   | `/verifyUser`         | No   | Match Patient ID, email and registered number; email a 6-digit activation code |
| POST   | `/verifyCode`         | No   | Verify the activation code                           |
| POST   | `/setPassword`        | No   | Set the password and activate the account            |
| POST   | `/login`              | No   | Log in and receive a token                           |
| POST   | `/codeReq`            | No   | Request a password-reset code                        |
| POST   | `/verifyRecoveryCode` | No   | Verify the password-reset code                       |
| POST   | `/resetPassword`      | No   | Set a new password                                   |

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
| GET    | `/api/aiChat/latest`  | Yes  | The signed-in user's most recent AI conversation: `{ sessionId, messages: [{ role, content, level, at }] }` (last 50 messages; empty for admins) |

## AI safety flags

| Method | Path                      | Auth          | Purpose |
| ------ | ------------------------- | ------------- | ------- |
| GET    | `/api/flags`              | Admin, Doctor | List flags, newest first. Filters: `?status=new\|reviewed`, `?level=urgent\|emergency`. Doctors only see their own patients' flags |
| PATCH  | `/api/flags/:id/review`   | Admin, Doctor | Mark a flag reviewed. Body: `{ note? }` |

## Medical records

Records are written by the hospital (sample data: `npm run seed:records -w @medibridge/server -- <PatientId>`).
Patients can only read their own.

| Method | Path                    | Auth    | Purpose |
| ------ | ----------------------- | ------- | ------- |
| GET    | `/api/records`          | Patient | The patient's records, newest visit first, with `doctor` populated (`docName`, `docImg`, `department`) |
| GET    | `/api/records/:id`      | Patient | One record |
| GET    | `/api/records/:id/pdf`  | Patient | The record as a PDF download (`Cache-Control: no-store`) |

A record has `type` (`consultation`, `lab_result`, `prescription`, `imaging`,
`discharge_summary`), `title`, `department`, `visitDate`, an optional
`summary`, and `sections: [{ heading, body }]`.

## Messages (patient ↔ doctor)

A conversation is all messages between one patient and one doctor. Patients
can message any doctor they have or had an appointment with; doctors can
message those patients. `:otherId` is the doctor's profile ID for a patient,
and the patient's user ID for a doctor (doctor accounts must be linked to a
profile). Anything not allowed answers `404`.

| Method | Path                                  | Auth            | Purpose |
| ------ | ------------------------------------- | --------------- | ------- |
| GET    | `/api/conversations`                  | Patient, Doctor | One entry per contact: `{ contact: { id, name, image, subtitle }, lastMessage, unreadCount }`, most recent first |
| GET    | `/api/conversations/:otherId`         | Patient, Doctor | `{ contact, messages }` (last 100, oldest first). Marks the other side's messages as read |
| POST   | `/api/conversations/:otherId/messages`| Patient, Doctor | Send `{ body }` (1–2,000 characters). Returns `{ message, safetyMessage? }`. Patient messages go through safety triage; see [ai.md](./ai.md) |

A message is `{ id, sender: "patient" | "doctor", body, createdAt, readAt }`.

## Account

Available to every signed-in role. Name, email, Patient ID and registered
number are hospital-managed and read-only.

| Method | Path                    | Auth | Purpose |
| ------ | ----------------------- | ---- | ------- |
| GET    | `/api/account`          | Yes  | `{ profile: { id, firstname, lastname, email, role, img, patientId, phone } }` |
| PATCH  | `/api/account`          | Yes  | Update the contact phone. Body: `{ PhoneNumber }` |
| PATCH  | `/api/account/password` | Yes  | Body: `{ currentPassword, newPassword, confirmPassword }`. A wrong current password is a `400` with `errors[].field = "currentPassword"` |
| PUT    | `/api/account/photo`    | Yes  | `multipart/form-data` with a `photo` field (JPG, PNG or WebP, max 2 MB). Returns the updated `profile` |
| DELETE | `/api/account/photo`    | Yes  | Remove the profile photo |

Login and password responses now include `user.img` when the user has a photo.

## Errors the client relies on

The client signs the user out on any `401` or `403`. Use those only for a
missing, invalid or wrong-role token. A wrong password, or a record or
conversation the user can't see, is a `400` or `404`.

## Not built yet

- Doctor and admin portals. Role checks exist (`requireRole`), but doctor
  accounts must be linked to a doctor profile (`Doctor.userId`) by hand for now.
- A `completed` appointment status, and doctor endpoints for writing medical
  records and reading records patients chose to share.
- Admin create, update and delete endpoints for doctors, patients and
  departments.
