import { Response } from "express";
import type { AuthRequest } from "../middlewares/Auth";
import * as conversationService from "../Services/conversationService";
import { ServiceError } from "../Services/errors";
import { sendError } from "../Utils/sendError";

// Admins and unlinked doctor accounts have no conversations.
async function requireViewer(req: AuthRequest) {
  const viewer = await conversationService.viewerFor(req.user!);
  if (!viewer) throw new ServiceError(404, "Conversation not found");
  return viewer;
}

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const viewer = await conversationService.viewerFor(req.user!);
    const conversations = viewer ? await conversationService.listConversations(viewer) : [];
    return res.status(200).json({ success: true, conversations });
  } catch (error) {
    return sendError(req, res, error);
  }
};

export const getConversation = async (req: AuthRequest, res: Response) => {
  try {
    const viewer = await requireViewer(req);
    const conversation = await conversationService.openConversation(viewer, req.params.otherId as string);
    return res.status(200).json({ success: true, ...conversation });
  } catch (error) {
    return sendError(req, res, error);
  }
};

export const sendConversationMessage = async (req: AuthRequest, res: Response) => {
  try {
    const viewer = await requireViewer(req);
    const result = await conversationService.sendMessage(viewer, req.params.otherId as string, req.body?.body);
    return res.status(201).json({ success: true, ...result });
  } catch (error) {
    return sendError(req, res, error);
  }
};
