# MediBridge AI

MediBridge uses AI in two places: the support chat (`POST /api/aiChat`) and
booking triage (inside `POST /api/bookAppointment`). The model is served by Groq
and set with `GROQ_MODEL`.

## Roles

The server picks the AI's role from the signed-in user's JWT role. It never
takes the role from anything the user writes.

| Role | Who | What it can do | What it can see |
| ---- | --- | -------------- | --------------- |
| **Safety triage** | Runs on every message from a visitor or patient, and on every booking reason | Classifies text as `routine`, `urgent` or `emergency`, and by category: `self_harm`, `medical`, `harm_to_others` or `none` | Only the text it is classifying |
| **Guest assistant** | Visitors who are not signed in | Explains the portal, helps choose a department, gives general health information | The hospital's department list |
| **Patient assistant** | JWT role `user` | Everything a guest assistant does, plus answers about the patient's own upcoming appointments | That patient's name and upcoming appointments |
| **Booking triage** | Every new booking | Sets the appointment's `urgency` so urgent requests stand out to the doctor | The reason for the visit |
| **Doctor assistant** | JWT role `doctor` | Summarises the doctor's schedule, explains urgency, drafts notes and messages. Everything it writes is a draft for the doctor to check | The linked doctor profile's upcoming appointments and those patients. Nothing about other doctors' patients |
| **Admin** | JWT role `admin` | No AI chat. Admins review and close safety flags | All flags |

Prompts and context builders live in `apps/Server/src/Services/aiRoles.ts`.
Triage lives in `apps/Server/src/Services/triage.ts`.

Rules shared by every chat role: the assistant is not a doctor, never
diagnoses, prescribes or changes doses, never claims to have taken an action in
the portal, and uses only the facts it was given about specific people.

## How safety triage works

1. **Keyword rules** run first and always run. They cover self-harm, medical
   red flags (such as crushing chest pain, not breathing, stroke signs, heavy
   bleeding and anaphylaxis) and threats to others. Negated phrases such as
   "no chest pain" do not match.
2. **The AI classifier** runs next and returns JSON. It uses
   `GROQ_TRIAGE_MODEL` if set, otherwise `GROQ_MODEL`. If it fails or times out,
   the keyword result is used alone.
3. The final level is the more severe of the two. The AI can raise a keyword
   result but never lower it. Only a doctor can lower an appointment's urgency,
   with `PATCH /api/appointment/:id/urgency`.

Doctors' messages are not triaged, because doctors describe patients'
symptoms all the time.

## What happens at each level

| Level | Chat | Booking |
| ----- | ---- | ------- |
| `emergency` | The AI is **not** called. The patient gets a fixed reply telling them to call emergency services (`HOSPITAL_EMERGENCY_NUMBER`), and a flag is saved | The booking is saved with `urgency.level = "emergency"`, the patient is shown the same emergency message, and a flag is saved |
| `urgent` | A flag is saved, and the AI is told to start by encouraging the person to get care today | The booking is marked urgent for the doctor, the patient sees a "get help if it gets worse" note, and a flag is saved |
| `routine` | Normal reply | Normal booking |

Flags are stored in the `FlaggedMessage` collection with the session or
appointment they came from, and a status of `new` or `reviewed`. Admins see all
flags. Doctors see flags from their own patients.

## Chat sessions

Each conversation is stored in `ChatSession`, and the last 12 messages are sent
to the AI so it can follow the conversation. The client sends back the
`sessionId` it received. A session is only reused by the same person in the
same role; otherwise a new one starts.

Chat sessions and flags contain health information. Decide on a retention
period before launch; nothing is deleted automatically yet.

## Limits

- Messages over 2,000 characters are rejected.
- Rate limit: 20 messages per 10 minutes for visitors (by IP) and 60 for
  signed-in users (by account).

## Setup

| Variable | Required | Purpose |
| -------- | -------- | ------- |
| `GROQ_API_KEY` | Yes | Groq API key |
| `GROQ_MODEL` | Yes | Chat model |
| `GROQ_TRIAGE_MODEL` | No | Faster model for triage |
| `HOSPITAL_EMERGENCY_NUMBER` | No | Shown in emergency replies. Without it, replies say "your local emergency number" |

For the doctor assistant to see a schedule, the doctor's login must be linked
to their profile: set `Doctor.userId` to the doctor's `User._id`.
