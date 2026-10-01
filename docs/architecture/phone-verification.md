# Phone numbers and SMS codes

How MediBridge matches patient phone numbers and sends activation and
password-reset codes by SMS, why it was built this way, and the alternatives
that were considered.

## What was broken

1. **Activation failed for correctly typed numbers.** The Activate page asks
   for the patient's registered phone number and suggests the format
   `(+234) 000-0000`. The server compared that text character for character
   with the stored value (for example `07031047842`), so `+234 703 104 7842`
   (the same phone) returned "Patient not found".
2. **The email had to match its exact capitalisation.** Emails are stored in
   lower case but were looked up as typed, so `Jane.Doe@Gmail.com` failed.
3. **Codes only went by email.** The "OTP" step never used the phone number,
   and no SMS was sent.

## How it works now

### 1. One format for every phone number

Every phone number is converted to **E.164**, the international standard
(`+2347031047842`), using
[libphonenumber-js](https://gitlab.com/catamphetamine/libphonenumber-js), a
maintained port of Google's phone number library.

| Typed by the patient    | Stored and compared as |
| ----------------------- | ---------------------- |
| `07031047842`           | `+2347031047842`       |
| `0703 104 7842`         | `+2347031047842`       |
| `+234 703 104 7842`     | `+2347031047842`       |
| `(+234) 703-104-7842`   | `+2347031047842`       |
| `2347031047842`         | `+2347031047842`       |
| `12345`                 | rejected as invalid    |

Numbers without a country code are read as Nigerian (`DEFAULT_PHONE_COUNTRY`,
default `NG`).

Where it happens:

| Layer | File | What it does |
| ----- | ---- | ------------ |
| Client form | `apps/Client/src/Validation/ActivationSchema.ts` | Rejects invalid numbers before submitting, with an example of a valid format |
| Server validation | `apps/Server/src/Validation/registerSchema.ts` | Same check; invalid input gets a `400` with a clear message |
| Server helper | `apps/Server/src/Utils/phone.ts` | `normalizePhone`, `samePhone`, `maskPhone` |
| Activation | `apps/Server/src/controller/AuthController.ts` | Finds the patient by User ID and email, then compares phones by value |
| Database | `apps/Server/src/Models/User.ts` | Converts `PhoneNumber` and `RegisteredNumber` to E.164 whenever they are saved, and rejects invalid new or changed numbers |

Activation compares numbers by value (`samePhone`), so it works for records
saved before this change as well as new ones. Every mismatch returns the same
"Patient not found" error, so a failed attempt never reveals which detail was
wrong.

### 2. Codes by email and SMS

`VerifyUser` (activation) and `ForgotPassword` (password reset, also used by
"Resend code") now send the same 6-digit code by email **and** SMS, at the
same time.

- The SMS always goes to the number **the hospital registered** for the
  patient, never to a number in the request. Nobody can make the server text
  an arbitrary number.
- SMS is a second channel. If it fails (provider down, no credit), the
  patient still gets the email and the request still succeeds; the failure is
  logged.
- The response includes `phone`, the masked number the code was texted to
  (`+234 *** *** 7842`), or `null` for email only. The Client shows it on the
  code-entry screens: "sent to your email and by SMS to +234 *** *** 7842".
- Each account can request at most **5 codes per 15 minutes**
  (`codeRequestAccountLimiter`), even from many IPs, which caps SMS cost.

### 3. SMS providers

`apps/Server/src/Services/sms.ts` exposes one function, `sendSms(to, text)`.
The provider is chosen by `SMS_PROVIDER`:

| Value     | What happens | When to use |
| --------- | ------------ | ----------- |
| `console` | Prints the message, including the code, to the server log. Refused in production. | Development and demos without an SMS account (default in development) |
| `termii`  | Sends through [Termii](https://termii.com) | Production in Nigeria |
| `twilio`  | Sends through [Twilio](https://twilio.com) | Production outside Nigeria |
| `none`    | SMS off; codes go by email only | Default in production until an account is set up |

## Turning on real SMS

1. Create a Termii account, fund it, and register a **sender ID** (for example
   `MediBridge`). Sender IDs are approved by Nigerian networks and can take a
   few days.
2. In `apps/Server/.env` (and in Render's environment settings):

   ```text
   SMS_PROVIDER=termii
   TERMII_API_KEY=<from the Termii dashboard>
   TERMII_SENDER_ID=MediBridge
   TERMII_BASE_URL=<base URL shown on your Termii dashboard>
   TERMII_CHANNEL=dnd
   ```

   `dnd` is required for OTPs: Nigeria's Do-Not-Disturb register blocks
   messages sent on the ordinary route to many numbers.
3. Restart the server and activate a test patient with your own number.

For Twilio, set `SMS_PROVIDER=twilio`, `TWILIO_ACCOUNT_SID`,
`TWILIO_AUTH_TOKEN`, and either `TWILIO_MESSAGING_SERVICE_SID` or
`TWILIO_FROM_NUMBER`.

## Cleaning up existing data

Activation already matches old formats, so this step is optional. It makes
stored data consistent:

```powershell
npm run migrate:phones -w @medibridge/server              # dry run: lists changes
npm run migrate:phones -w @medibridge/server -- --apply   # writes them
```

Numbers that cannot be parsed, or that two patients would share once
normalised, are reported and left for someone to fix by hand. Records with an
old invalid number keep working until they are corrected.

## Why this approach

- **Normalise to E.164 rather than match loosely.** One canonical format means
  every comparison, uniqueness check and SMS uses the same value. E.164 is
  also what every SMS provider expects.
- **Use libphonenumber-js rather than a regex.** Phone rules differ by country
  and network prefix and change over time. The library is maintained, tracks
  Google's metadata, and handles every format patients type. A hand-written
  regex would need updating each time a network adds a prefix.
- **Compare after lookup rather than migrating first.** Finding the patient by
  User ID and email and then comparing phones by value works on day one, with
  no risky migration of real patient records before it can be used.
- **SMS as a second channel next to email.** Patients who don't check email
  can still activate, and an SMS outage never blocks anyone.
- **A small provider layer with a console default.** The whole flow can be
  demonstrated to hospitals before any SMS account exists, and changing
  provider is a configuration change, not a code change.
- **Termii first.** It is Nigerian, bills in naira, supports the DND route that
  OTPs need, and is cheaper for Nigerian numbers than international providers.
- **Plain HTTP calls instead of provider SDKs.** Each provider needs one
  request, so `axios` (already a dependency) avoids adding a large SDK per
  provider.
- **Send only to the registered number, and cap requests per account.** This
  prevents "SMS pumping" fraud, where attackers trigger texts to numbers they
  profit from, and bounds what one account can cost.

## Other methods considered

### Matching phone numbers

| Method | How | Trade-off |
| ------ | --- | --------- |
| **E.164 with libphonenumber-js** (chosen) | Parse and format every number | Correct for all countries; one small dependency |
| Strip non-digits and compare the last 10 digits | `replace(/\D/g, "").slice(-10)` | No dependency, but no validation, and it can match different numbers in other countries |
| Regex per format | A pattern for each accepted format | Brittle; breaks when networks add prefixes |
| Store several formats | Save `0803…` and `+234803…` side by side | Duplicated data that drifts out of sync |
| Database collation or query setters | Let MongoDB or Mongoose normalise lookups | Hides the rule in configuration and needs migrated data first |

### Sending the code

| Method | Trade-off |
| ------ | --------- |
| **Email and SMS together** (chosen) | Highest delivery rate; costs per SMS |
| Email only (before) | Free, but many patients rarely check email |
| SMS only | Simple for patients, but an SMS outage blocks activation |
| Let the patient choose email or SMS | Cheaper; one extra step in the form |
| WhatsApp (Termii and Twilio both offer it) | Cheap and widely used in Nigeria; needs Meta business verification |
| Voice call OTP | Works on basic phones and for patients who can't read; costs more |
| Authenticator app (TOTP) | Free and secure, but too complex for first-time patient activation |
| Magic link in email | No code to type; email only |

### SMS providers

| Provider | Notes |
| -------- | ----- |
| **Termii** (default) | Nigerian; DND route for OTPs; also offers a hosted OTP ("token") API |
| Twilio (supported) | Global, excellent tooling; pricier for Nigerian numbers; Twilio Verify can manage codes for you |
| Africa's Talking | Pan-African; similar to Termii |
| AWS SNS | Cheap at scale if already on AWS; sender ID rules vary by country |
| Vonage / Infobip | Enterprise-grade, global |

A hosted OTP API (Termii Token, Twilio Verify) would generate, send, expire
and check codes for you. MediBridge already generates and checks its own
codes, so it only needs plain sending. A hosted API is worth considering if
code handling ever becomes a burden.

## Known limits

- Codes are stored in plain text in the database. Hashing them is a
  worthwhile follow-up.
- Activation and reset share one code field, so requesting a reset code
  replaces an unused activation code (and the other way round). This is
  unchanged from before.
- The `console` provider prints codes to the log. It is for development only
  and is refused when `NODE_ENV=production`.
