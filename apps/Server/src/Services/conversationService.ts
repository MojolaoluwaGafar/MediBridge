import mongoose from "mongoose";
import { Message, type MessageSender } from "../Models/Message";
import { Appointment } from "../Models/Appointment";
import { Doctor } from "../Models/Doctor";
import { User } from "../Models/User";
import Flagged from "../Models/Flagged";
import type { JWTPayLoad } from "../middlewares/Auth";
import { getDoctorForUser } from "../Utils/doctorAccount";
import { triage, needsFlag, emergencyReply, type TriageLevel } from "./triage";
import { ServiceError } from "./errors";

export const MAX_MESSAGE_LENGTH = 2000;
const MESSAGES_PER_CONVERSATION = 100;
const { ObjectId } = mongoose.Types;
type Id = mongoose.Types.ObjectId;

// The same functions serve patients and (later) the doctor portal. A viewer is
// whoever is asking: patients are identified by their User ID, doctors by
// their Doctor profile ID, so a doctor login must be linked to a profile.
export interface Viewer {
  side: MessageSender;
  selfId: Id;
}

interface Contact {
  id: string;
  name: string;
  image: string | null;
  subtitle: string;
}

// Not-allowed cases are 404, never 403: the client signs people out on 403.
const conversationNotFound = () => new ServiceError(404, "Conversation not found");

const otherSide = (side: MessageSender): MessageSender => (side === "patient" ? "doctor" : "patient");

// Null for roles that don't message (admins) and unlinked doctor accounts.
export async function viewerFor(user: JWTPayLoad): Promise<Viewer | null> {
  if (user.role === "user") {
    return { side: "patient", selfId: new ObjectId(user.id) };
  }
  if (user.role === "doctor") {
    const doctor = await getDoctorForUser(user.id);
    return doctor ? { side: "doctor", selfId: doctor._id as Id } : null;
  }
  return null;
}

// The (patient, doctor) pair for a conversation between the viewer and `otherId`.
const pairFor = (viewer: Viewer, otherId: Id) =>
  viewer.side === "patient" ? { patient: viewer.selfId, doctor: otherId } : { patient: otherId, doctor: viewer.selfId };

// People the viewer may message: anyone they have (or had) an appointment
// with, plus anyone they already have messages with.
async function contactIds(viewer: Viewer): Promise<Id[]> {
  const appointmentFilter = viewer.side === "patient" ? { userId: viewer.selfId } : { doctor: viewer.selfId };
  const appointmentField = viewer.side === "patient" ? "doctor" : "userId";

  const [fromAppointments, fromMessages] = await Promise.all([
    Appointment.distinct(appointmentField, appointmentFilter),
    Message.distinct(otherSide(viewer.side), { [viewer.side]: viewer.selfId }),
  ]);

  const unique = new Map<string, Id>();
  for (const id of [...fromAppointments, ...fromMessages]) {
    if (id) unique.set(id.toString(), id as Id);
  }
  return [...unique.values()];
}

// Checks the viewer may talk to `otherIdText` and returns it as an ObjectId.
async function allowedContact(viewer: Viewer, otherIdText: string): Promise<Id> {
  if (!mongoose.Types.ObjectId.isValid(otherIdText)) throw conversationNotFound();
  const otherId = new ObjectId(otherIdText);
  const pair = pairFor(viewer, otherId);

  const [hasAppointment, hasMessages] = await Promise.all([
    Appointment.exists({ userId: pair.patient, doctor: pair.doctor }),
    Message.exists(pair),
  ]);
  if (!hasAppointment && !hasMessages) throw conversationNotFound();
  return otherId;
}

// The other person in each conversation, in the same shape for both sides.
async function contactsById(viewer: Viewer, ids: Id[]): Promise<Map<string, Contact>> {
  if (viewer.side === "patient") {
    const doctors = await Doctor.find({ _id: { $in: ids } }, { docName: 1, docImg: 1, department: 1 }).lean();
    return new Map(
      doctors.map((d) => [
        d._id.toString(),
        { id: d._id.toString(), name: d.docName, image: d.docImg || null, subtitle: `${d.department} Department` },
      ])
    );
  }

  const patients = await User.find({ _id: { $in: ids } }, { FirstName: 1, LastName: 1, UserId: 1, ProfileImage: 1 }).lean();
  return new Map(
    patients.map((p) => [
      p._id.toString(),
      { id: p._id.toString(), name: `${p.FirstName} ${p.LastName}`, image: p.ProfileImage || null, subtitle: p.UserId },
    ])
  );
}

const toDto = (m: { _id: unknown; sender: MessageSender; body: string; createdAt: Date; readAt?: Date | null }) => ({
  id: String(m._id),
  sender: m.sender,
  body: m.body,
  createdAt: m.createdAt,
  readAt: m.readAt ?? null,
});

export async function listConversations(viewer: Viewer) {
  const ids = await contactIds(viewer);
  const other = otherSide(viewer.side);

  const [contacts, lastMessages, unread] = await Promise.all([
    contactsById(viewer, ids),
    Message.aggregate([
      { $match: { [viewer.side]: viewer.selfId } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: `$${other}`, message: { $first: "$$ROOT" } } },
    ]),
    Message.aggregate([
      { $match: { [viewer.side]: viewer.selfId, sender: other, readAt: null } },
      { $group: { _id: `$${other}`, count: { $sum: 1 } } },
    ]),
  ]);

  const lastById = new Map(lastMessages.map((m) => [m._id.toString(), m.message]));
  const unreadById = new Map(unread.map((u) => [u._id.toString(), u.count as number]));
  const sentAt = (c: { lastMessage: { createdAt: Date } | null }) =>
    c.lastMessage ? new Date(c.lastMessage.createdAt).getTime() : 0;

  return (
    ids
      .flatMap((id) => {
        const contact = contacts.get(id.toString());
        if (!contact) return [];
        const last = lastById.get(id.toString());
        return [{ contact, lastMessage: last ? toDto(last) : null, unreadCount: unreadById.get(id.toString()) ?? 0 }];
      })
      // Most recent conversation first; contacts with no messages yet go last.
      .sort((a, b) => sentAt(b) - sentAt(a))
  );
}

// Opening a conversation marks the other side's messages as read.
export async function openConversation(viewer: Viewer, otherIdText: string) {
  const otherId = await allowedContact(viewer, otherIdText);
  const pair = pairFor(viewer, otherId);

  const [contacts, newestFirst] = await Promise.all([
    contactsById(viewer, [otherId]),
    Message.find(pair).sort({ createdAt: -1 }).limit(MESSAGES_PER_CONVERSATION).lean(),
  ]);
  await Message.updateMany({ ...pair, sender: otherSide(viewer.side), readAt: null }, { readAt: new Date() });

  return { contact: contacts.get(otherId.toString()) ?? null, messages: newestFirst.reverse().map(toDto) };
}

export async function sendMessage(viewer: Viewer, otherIdText: string, rawBody: unknown) {
  const text = typeof rawBody === "string" ? rawBody.trim() : "";
  if (!text) throw new ServiceError(400, "Message cannot be empty", "body");
  if (text.length > MAX_MESSAGE_LENGTH) {
    throw new ServiceError(400, `Please keep messages under ${MAX_MESSAGE_LENGTH} characters.`, "body");
  }

  const otherId = await allowedContact(viewer, otherIdText);
  const pair = pairFor(viewer, otherId);
  const message = await Message.create({ ...pair, sender: viewer.side, body: text });

  // A doctor may not read a message for hours, so patient messages get the
  // same safety triage as the AI chat and bookings: flag them for review and
  // tell the patient where to get help now.
  let urgency: TriageLevel = "routine";
  let safetyMessage: string | undefined;
  if (viewer.side === "patient") {
    const result = await triage(text);
    urgency = result.level;

    if (needsFlag(result)) {
      await Flagged.create({
        source: "message",
        userId: pair.patient,
        message: text,
        reason: result.reason,
        level: result.level,
        category: result.category,
        triageSource: result.source,
      });
    }
    if (result.level === "emergency") {
      safetyMessage = emergencyReply(result.category);
    } else if (result.level === "urgent") {
      safetyMessage =
        result.category === "self_harm"
          ? "Your doctor may not see this message straight away. If you're thinking about harming yourself, please talk to someone you trust or a crisis line now, and if you're in danger, call emergency services."
          : "Your doctor may not see this message straight away. If you need care today, contact the hospital or book the earliest appointment. If things get worse, call emergency services.";
    }
  }

  return { message: toDto(message), urgency, safetyMessage };
}
