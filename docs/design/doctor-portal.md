# Doctor portal: screen spec (first pass)

The doctor portal is the doctor's side of MediBridge. This spec covers the
first two screens, **Dashboard** and **Patient profile**, and is the source for
the Figma frames on the `Doctor & Admin Portal` page of the MediBridge Figma
file.

The doctor portal reuses the patient portal's shell (top bar, sidebar, cards,
buttons) so the two sides feel like one product. Anything not described here
should match the Patient Page section on the `final design` page.

## Foundations

Use the existing Figma styles; do not create new ones.

| Use                       | Figma style                     | Code today                  |
| ------------------------- | ------------------------------- | --------------------------- |
| Page title                | `header 4/medium` (Outfit 24)   | `text-[28px] font-medium`   |
| Section heading           | `header 4/medium` (Outfit 24)   | `text-2xl font-medium`      |
| Card title / patient name | `body 1/medium` (Outfit 20)     | `text-[20px] font-medium`   |
| Body / table cells        | `small text 1/regular` (Outfit 16) | `text-base`              |
| Meta, labels, captions    | `small text 2/regular` (Outfit 14) | `text-sm`                |
| Primary brand             | `green 100`                     | `#28574E`                   |
| Light brand fill (chips, icon tiles) | `mint 100`           | `#E0F8F3` / `#E3FDF7`       |
| Card border               | `border`                        | `#D7D7D7`                   |
| Secondary text            | `gray 300`                      | `#605E5E`                   |
| Status colors             | `status/success`, `status/warning`, `status/critical`, `status/info` | green / amber / red |

Layout: desktop frame 1440 wide, same as the patient frames. The sidebar is
288 wide (`w-72`), content padding 24, gap between cards 24–40, card radius 12,
button/input radius 8.

## Shared shell

Copy the patient shell and change only these parts.

**Top bar**: logo on the left, page title in the middle (`Dashboard`, or
`Patient profile`), and on the right the notification bell and user menu.
The user menu shows `Dr. <First> <Last>` with the department under it in
`small text 2/regular`.

**Sidebar tabs** (lucide icons, same active style: `green 100` fill, white text):

| Tab            | Icon              | In this pass |
| -------------- | ----------------- | ------------ |
| Dashboard      | `LayoutDashboard` | Designed     |
| Appointments   | `CalendarDays`    | Tab only     |
| Patients       | `Users`           | Tab only; opens Patient profile |
| Availability   | `Clock`           | Tab only     |
| Messages       | `MessageCircleMore` | Tab only   |
| Log out        | `PiSignOut`, red  | Same as patient |

## Screen 1: Dashboard

Frame name: `Doctor / Dashboard`. Top to bottom:

### 1. Greeting banner

Same component as the patient `DashboardGreeting` (`green 100` fill, radius 12,
min height 112).

- Title: `Good morning, Dr. Adaeze Okafor 👋`
- Subtitle: `You have 6 appointments today and 3 requests waiting for you.`
- Right side (desktop only): today's date, `Monday, 28 September 2026`, in
  white `small text 1/regular`.

### 2. Stat tiles

A row of four equal tiles, border card style, 24 gap. Each tile has a 44×44
`mint 100` icon tile with a `green 100` icon, a label in `small text 2/regular`
`gray 300`, and a big number in `header 4/semibold`.

| Label                  | Value | Icon            | Data                                             |
| ---------------------- | ----- | --------------- | ------------------------------------------------ |
| Today's appointments   | 6     | `CalendarDays`  | Doctor's appointments where `date` = today, not cancelled |
| Pending requests       | 3     | `Hourglass`     | Status `pending`                                 |
| Patients this week     | 18    | `Users`         | Distinct `userId`s this week                      |
| Completed this week    | 14    | `CircleCheck`   | Status `completed` (new status, see API notes)   |

### 3. Two columns

Left column 2/3 wide, right column 1/3 (same split as the patient dashboard's
Upcoming Appointment + Quick Actions).

**Left: "Today's schedule"** (section heading + `View all` text link in
`green 100` on the right).

One border card holding a vertical list of rows, divided by `border` lines.
Each row:

- Time on the left, fixed 72 wide: `09:00` in `small text 1/medium`, `30 min`
  under it in `small text 2/regular` `gray 300`.
- Patient initials avatar (40, `mint 100` fill, `green 100` initials), then
  the patient name (`small text 1/medium`) and the reason for the visit
  (`small text 2/regular`, one line with ellipsis).
- A status chip on the right, the same pill as the patient `AppointmentCard`:
  `Confirmed` (`mint 100` / `green 100`), `Checked in` (`status/info`),
  `Completed` (gray).
- The row for the next appointment gets a 4px `green 100` bar on its left edge
  and a `Next` label next to the time.
- The whole row opens that patient's profile.

Sample rows:

| Time  | Patient           | Reason                         | Status    |
| ----- | ----------------- | ------------------------------ | --------- |
| 09:00 | Tunde Bakare      | Follow-up: blood pressure      | Completed |
| 10:30 | Chioma Nwosu      | Chest pain on exertion         | Next · Confirmed |
| 11:15 | Ibrahim Musa      | Post-surgery review            | Confirmed |
| 13:00 | Grace Eze         | ECG results                    | Confirmed |
| 14:30 | Samuel Adeyemi    | Palpitations                   | Confirmed |
| 16:00 | Fatima Bello      | New patient consultation       | Confirmed |

Empty state (separate small frame, `Doctor / Dashboard / Empty schedule`),
following the patient `EmptyAppointmentState`: title `No appointments today`,
body `Confirmed appointments for today will show here.`, no button.

**Right: "Pending requests"** (section heading + count badge `3`).

A stack of border cards, one per request:

- Patient name (`body 2/medium`) and requested slot
  (`CalendarDays` `Tue, 29 Sep` · `Clock` `11:00`) in `gray 300`.
- Reason in `small text 2/regular`, at most 2 lines.
- If the patient shared records: a small `FileText` + `Records shared` chip
  (`mint 100`).
- Buttons in a row: `Confirm` (primary, filled `green 100`) and `Decline`
  (outline, red text). Same `Button` component as the patient side.

Below the stack, a `View all requests` text link.

Empty state: `No pending requests. You're all caught up.`

### 4. Recent activity

Same heading and bordered container as the patient `Recent Activities`, with
doctor events, for example:

- `You confirmed Chioma Nwosu's appointment for 28 Sep, 10:30.` · 2h ago
- `Ibrahim Musa rescheduled to 28 Sep, 11:15.` · Yesterday
- `Grace Eze shared her medical records with you.` · Yesterday

## Screen 2: Patient profile

Frame name: `Doctor / Patient profile`. Opened from a schedule row, a request
card, or the Patients tab. Sidebar active tab: `Patients`.

### 1. Header

- Back link `← Back to dashboard` (`green 100`, `small text 1/medium`).
- Border card with: a 72 initials avatar; the name `Chioma Nwosu` in
  `header 4/medium`; and a row of meta details in `gray 300`: `Patient ID
  MB-20431` · `Female` · `34 yrs` · `+234 803 555 0142` · `chioma.n@example.com`.
- Right side of the card: the next appointment with this doctor,
  `Next visit: Today, 10:30`, and two buttons, `Message` (outline) and
  `Start visit` (primary).

> Data today: `User` has name, email, phone, `UserId` and `RegisteredNumber`.
> Sex and date of birth are not stored yet, so hide those details until the
> model has them.

### 2. Tabs

Three tabs under the header, underline style (active: `green 100` text with a
2px `green 100` underline): **Overview** (designed), **Appointments**,
**Records**.

### 3. Overview tab, two columns (2/3 + 1/3)

**Left: "Reason for this visit"** card: the appointment's `reason` text, the
booked date and time, and the department.

**Left: "Appointment history"** card: a table with columns `Date`, `Time`,
`Reason`, `Status`. Newest first, at most 5 rows, then a `View all` link.
Only appointments between this patient and this doctor are listed.

| Date        | Time  | Reason                   | Status    |
| ----------- | ----- | ------------------------ | --------- |
| 28 Sep 2026 | 10:30 | Chest pain on exertion   | Confirmed |
| 02 Aug 2026 | 09:00 | Routine check-up         | Completed |
| 14 May 2026 | 14:00 | Palpitations             | Cancelled |

**Right: "Shared records"** card. Two variants, and both should be designed:

- *Shared* (`Records shared` chip in `status/success`): a list of record rows,
  each with a `FileText` icon, a title, a date and a `View` link. Examples:
  `ECG report · 20 Sep 2026`, `Lipid panel · 12 Aug 2026`,
  `Discharge summary · 03 Mar 2026`.
- *Not shared* (locked): a `Lock` icon in a `gray 100` tile, title
  `Records not shared`, body `Chioma hasn't shared her medical records for
  this appointment. You can ask her to share them.`, and an outline button
  `Request access`.

**Right: "Visit notes"** card: a multi-line text area with the placeholder
`Add notes for this visit…` and a primary `Save note` button. Earlier notes
are listed under it with a date and time.

## States to design

| Frame                                   | Why                                  |
| --------------------------------------- | ------------------------------------ |
| `Doctor / Dashboard`                    | Main screen with the sample data above |
| `Doctor / Dashboard / Empty schedule`   | No appointments today                |
| `Doctor / Patient profile`              | Records shared                       |
| `Doctor / Patient profile / Records locked` | `shareRecords` is false          |
| `Doctor / Decline request` (modal)      | Optional reason field + `Decline` / `Keep request` buttons |
| Mobile 375 of both main screens         | Sidebar collapses to the menu button, as on the patient side |

## What the API needs for these screens

These screens depend on backend work that doesn't exist yet. It's listed here
so design and API stay in step. The API itself is documented in
[`docs/architecture/api.md`](../architecture/api.md).

- **Link doctors to logins.** `Doctor` has no reference to `User`, so a
  logged-in doctor can't be matched to their doctor profile. Add
  `Doctor.userId` (or `User.doctorId`).
- **Role guard.** `authMiddleware` only checks the token. Doctor routes need
  a `role === "doctor"` check, and the client needs a doctor route next to
  `/patientDashboard`.
- **Appointment status.** Add `completed` (and optionally `checked_in`) to the
  status enum, which is `pending | confirmed | cancelled` today.
- **Endpoints**
  - `GET /api/doctor/appointments?date=&status=`: dashboard stats, schedule,
    pending requests
  - `PATCH /api/appointment/:id/confirm` and `/decline` (with an optional
    reason)
  - `GET /api/doctor/patients/:id`: patient details plus appointment
    history with this doctor, and records only when `shareRecords` is true
  - `POST /api/appointment/:id/notes`: visit notes (new model)
- **Records.** No medical-records model exists yet, so the Shared records card
  is design-only until one is added.
