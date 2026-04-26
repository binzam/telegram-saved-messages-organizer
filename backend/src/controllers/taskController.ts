import { Response } from "express";
import Task from "../models/Task.js";
import { AuthRequest } from "./messagesController.js";
import Message from "../models/Message.js";
import Session from "../models/Session.js";

export async function createTask(
  req: AuthRequest,
  res: Response,
): Promise<Response | void> {
  const { messageId, title, note, reminderAt, notifyVia } = req.body;
  console.log("req.body create Task", req.body);
  if (!messageId || !reminderAt) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const activeSession = await Session.findOne({});
    const targetChatId = activeSession?.chatId;
    const task = await Task.create({
      messageId,
      title,
      note,
      reminderAt: new Date(reminderAt),
      notifyVia,
      targetChatId,
    });
    await Message.updateOne({ messageId }, { $set: { hasTask: true } });
    return res.json({ ok: true, task });
  } catch (err) {
    return res.status(500).json({ error: "Failed to create task" });
  }
}
export async function getTasksByMessage(
  req: AuthRequest,
  res: Response,
): Promise<Response | void> {
  const { messageId } = req.params;

  if (!messageId) {
    return res.status(400).json({ error: "Missing messageId" });
  }

  try {
    const [message, tasks] = await Promise.all([
      Message.findOne({ messageId }).lean(),
      Task.find({ messageId }).sort({ reminderAt: 1 }).lean(),
    ]);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    return res.json({
      message: {
        ...message,
        tasks: tasks,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch tasks" });
  }
}
