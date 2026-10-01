import { Response } from "express";
import mongoose from "mongoose";
import { Message } from "../Models/Message";
import { Appointment } from "../Models/Appointment";
import { Doctor } from "../Models/Doctor";
import { User } from "../Models/User";
import Flagged from "../Models/Flagged";
import type { AuthRequest } from "../middlewares/Auth";
import { getDoctorForUser } from "../Utils/doctorAccount";
import { triage, needsFlag, emergencyReply } from "../Services/triage";

const MAX_MESSAGE_LENGTH = 2000;
const PAGE_SIZE = 100;
const { ObjectId } = mongoose.Types;

type Side = "patient" | "doctor";

// Who is asking, from the token. Patients are identified by their User ID,
// doctors by their Doctor profile ID (a doctor login must be linked to one).
interface Viewer {
  side: Side;
  selfId: mongoose.Types.ObjectId;
}

async function getViewer(req: AuthRequest): Promise<Viewer | null> {
  if (req.user?.role === "user") {
    return { side: "patient", selfId: new ObjectId(req.user.id) };
  }
  if (req.user?.role === "doctor") {
    const doctor = await getDoctorForUser(req.user.id);
    return doctor ? { side: "doctor", selfId: doctor._id as mongoose.Types.ObjectId } : null;
  }
  return null;
}

// The (patient, doctor) pair for a conversation between the viewer and `otherId`.
function pairFor(viewer: Viewer, otherId: mongoose.Types.ObjectId) {
  return viewer.side === "patient"
    ? { patient: viewer.selfId, doctor: otherId }
    : { patient: otherId, doctor: viewer.selfId };
}

// People the viewer may message: anyone they have (or had) an appointment
// with, plus anyone they already have messages with.
async function contactIds(viewer: Viewer): Promise<mongoose.Types.ObjectId[]> {
  const [mine, theirs] = viewer.side === "patient" ? ["userId", "doctor"] : ["doctor", "userId"];
  const [fromAppointments, fromMessages] = await Promise.all([
    Appointment.distinct(theirs, { [mine]: viewer.selfId }),
    Message.distinct(viewer.side === "patient" ? "doctor" : "patient", { [viewer.side]: viewer.selfId }),
  ]);

  const unique = new Map<string, mongoose.Types.ObjectId>();
  for (const id of [...fromAppointments, ...fromMessages]) {
    if (id) unique.set(id.toString(), id as mongoose.Types.ObjectId);
  }
  return [...unique.values()];
}

async function canMessage(viewer: Viewer, otherId: mongoose.Types.ObjectId) {
  const pair = pairFor(viewer, otherId);
  const [hasAppointment, hasMessages] = await Promise.all([
    Appointment.exists({ userId: pair.patient, doctor: pair.doctor }),
    Message.exists(pair),
  ]);
  return Boolean(hasAppointment || hasMessages);
}

// A short description of the other person, shaped the same for both sides.
async function contactsById(viewer: Viewer, ids: mongoose.Types.ObjectId[]) {
  if (viewer.side === "patient") {
    const doctors = await Doctor.find({ _id: { $in: ids } }, { docName: 1, docImg: 1, department: 1 }).lean();
    return new Map(doctors.map((d) => [d._id.toString(), { id: d._id.toString(), name: d.docName, image: d.docImg ?? null, subtitle: `${d.department} Department` }]));
  }
  const patients = await User.find({ _id: { $in: ids } }, { FirstName: 1, LastName: 1, UserId: 1, ProfileImage: 1 }).lean();
  return new Map(patients.map((p) => [p._id.toString(), { id: p._id.toString(), name: `${p.FirstName} ${p.LastName}`, image: p.ProfileImage ?? null, subtitle: p.UserId }]));
}

const otherSide = (side: Side): Side => (side === "patient" ? "doctor" : "patient");

const toDto = (m: { _id: unknown; sender: Side; body: string; createdAt: Date; readAt?: Date | null }) => ({
  id: String(m._id),
  sender: m.sender,
  body: m.body,
  createdAt: m.createdAt,
  readAt: m.readAt ?? null,
});

function parseOtherId(req: AuthRequest) {
  const id = req.params.otherId as string;
  return mongoose.Types.ObjectId.isValid(id) ? new ObjectId(id) : null;
}

// Not-allowed cases answer 404, not 403: the client signs people out on 403.
const notFound = (res: Response) => res.status(404).json({ success: false, message: "Conversation not found" });

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const viewer = await getViewer(req);
    if (!viewer) return res.status(200).json({ success: true, conversations: [] });

    const ids = await contactIds(viewer);
    const otherField = otherSide(viewer.side);

    const [contacts, lastMessages, unread] = await Promise.all([
      contactsById(viewer, ids),
      Message.aggregate([
        { $match: { [viewer.side]: viewer.selfId } },
        { $sort: { createdAt: -1 } },
        { $group: { _id: `$${otherField}`, message: { $first: "$$ROOT" } } },
      ]),
      Message.aggregate([
        { $match: { [viewer.side]: viewer.selfId, sender: otherField, readAt: null } },
        { $group: { _id: `$${otherField}`, count: { $sum: 1 } } },
      ]),
    ]);

    const lastById = new Map(lastMessages.map((m) => [m._id.toString(), m.message]));
    const unreadById = new Map(unread.map((u) => [u._id.toString(), u.count as number]));

    const conversations = ids
      .map((id) => {
        const contact = contacts.get(id.toString());
        if (!contact) return null;
        const last = lastById.get(id.toString());
        return {
          contact,
          lastMessage: last ? toDto(last) : null,
          unreadCount: unreadById.get(id.toString()) ?? 0,
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null)
      // Most recent conversation first; contacts with no messages yet go last.
      .sort((a, b) => (b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0) - (a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0));

    return res.status(200).json({ success: true, conversations });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

export const getConversation = async (req: AuthRequest, res: Response) => {
  try {
    const viewer = await getViewer(req);
    const otherId = parseOtherId(req);
    if (!viewer || !otherId || !(await canMessage(viewer, otherId))) return notFound(res);

    const pair = pairFor(viewer, otherId);
    const [contacts, newestFirst] = await Promise.all([
      contactsById(viewer, [otherId]),
      Message.find(pair).sort({ createdAt: -1 }).limit(PAGE_SIZE).lean(),
    ]);

    // Opening the conversation marks the other side's messages as read.
    await Message.updateMany({ ...pair, sender: otherSide(viewer.side), readAt: null }, { readAt: new Date() });

    return res.status(200).json({
      success: true,
      contact: contacts.get(otherId.toString()) ?? null,
      messages: newestFirst.reverse().map(toDto),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

export const sendConversationMessage = async (req: AuthRequest, res: Response) => {
  try {
    const viewer = await getViewer(req);
    const otherId = parseOtherId(req);
    if (!viewer || !otherId || !(await canMessage(viewer, otherId))) return notFound(res);

    const text = typeof req.body?.body === "string" ? req.body.body.trim() : "";
    if (!text) {
      return res.status(400).json({ success: false, message: "Message cannot be empty" });
    }
    if (text.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ success: false, message: `Please keep messages under ${MAX_MESSAGE_LENGTH} characters.` });
    }

    const pair = pairFor(viewer, otherId);
    const message = await Message.create({ ...pair, sender: viewer.side, body: text });

    // Doctors may not read messages for hours, so patient messages get the same
    // safety triage as the AI chat and bookings: flag them, and tell the
    // patient where to get help now.
    let safetyMessage: string | undefined;
    if (viewer.side === "patient") {
      const result = await triage(text);
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
        safetyMessage = "Your doctor may not see this message straight away. If you need care today, contact the hospital or book the earliest appointment. If things get worse, call emergency services.";
      }
    }

    return res.status(201).json({ success: true, message: toDto(message), safetyMessage });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
