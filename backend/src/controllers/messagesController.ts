import { Request, Response } from "express";
import Message from "../models/Message.js";
import { decrypt } from "../utils/crypto.js";
import telegramService from "../services/telegramService.js";
import { normalizeMessage } from "../utils/normalizeMessage.js";

export interface AuthRequest extends Request {
  sessionDoc?: {
    session: string;
    [key: string]: any;
  };
}

export async function getMessages(
  req: AuthRequest,
  res: Response,
): Promise<Response | void> {
  const { tag, type, page = "1", limit = "20" } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  try {
    const query: any = {};
    if (tag) query.$or = [{ autoTags: tag }, { userTags: tag }];
    if (type) query.type = type;

    let currentTotal = await Message.countDocuments(query);

    if (pageNum === 1 || skip + limitNum >= currentTotal) {
      const sess = req.sessionDoc;
      if (sess && sess.session) {
        const sessionString = decrypt(sess.session);
        const client = await telegramService.init(sessionString);

        let fetchOptions: { limit: number; offsetId?: number } = { limit: 100 };

        if (pageNum > 1) {
          const oldestMsg = await Message.findOne().sort({ date: 1 });
          if (oldestMsg) {
            fetchOptions.offsetId = parseInt(oldestMsg.messageId, 10);
          }
        }

        const messages = await client.getMessages("me", fetchOptions);

        if (messages.length > 0) {
          const normalized = messages.map(normalizeMessage);
          const bulkOps = normalized.map((m) => ({
            updateOne: {
              filter: { messageId: m.messageId },
              update: { $set: m },
              upsert: true,
            },
          }));

          await Message.bulkWrite(bulkOps);
          currentTotal = await Message.countDocuments(query);
        }
      }
    }

    const results = await Message.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const hasMore = skip + results.length < currentTotal;

    return res.json({
      messages: results,
      hasMore,
      total: currentTotal,
    });
  } catch (err) {
    console.error("getMessages error", err);
    return res.status(500).json({ error: "Failed to fetch messages" });
  }
}

export async function getMedia(
  req: AuthRequest,
  res: Response,
): Promise<Response | void> {
  const { messageId } = req.params;

  try {
    if (!req.sessionDoc?.session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const sessionString = decrypt(req.sessionDoc.session);
    const client = await telegramService.init(sessionString);

    const messages = await client.getMessages("me", {
      ids: [parseInt(messageId as string, 10)],
    });

    if (!messages || messages.length === 0 || !messages[0].media) {
      return res.status(404).json({ error: "Media not found" });
    }

    const buffer = await client.downloadMedia(messages[0]);

    if (!buffer) {
      return res.status(404).json({ error: "Could not download media" });
    }

    // Narrowing types for the MTProto payloads
    const media = messages[0].media as any;

    if (media?.document?.mimeType) {
      res.setHeader("Content-Type", media.document.mimeType);
    } else if (media?.className === "MessageMediaPhoto") {
      res.setHeader("Content-Type", "image/jpeg");
    }

    res.setHeader("Cache-Control", "public, max-age=31536000");
    return res.send(buffer);
  } catch (err) {
    console.error("getMedia error", err);
    return res.status(500).json({ error: "Failed to stream media" });
  }
}

export async function tagMessage(
  req: AuthRequest,
  res: Response,
): Promise<Response | void> {
  const { messageId, tags } = req.body;

  if (!messageId || !Array.isArray(tags)) {
    return res.status(400).json({ error: "messageId and tags[] required" });
  }

  try {
    const doc = await Message.findOneAndUpdate(
      { messageId },
      { $addToSet: { userTags: { $each: tags } }, updatedAt: new Date() },
      { new: true, upsert: true },
    );
    return res.json({ ok: true, message: doc });
  } catch (err) {
    console.error("tagMessage error", err);
    return res.status(500).json({ error: "Failed to tag message" });
  }
}
export async function deleteMessage(
  req: AuthRequest,
  res: Response,
): Promise<Response | void> {
  const { messageId } = req.params;

  if (!messageId) {
    return res.status(400).json({ error: "messageId is required" });
  }

  try {
    const sess = req.sessionDoc;
    if (!sess || !sess.session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const sessionString = decrypt(sess.session);
    const client = await telegramService.init(sessionString);

    // 1. Delete from Telegram Saved Messages ("me")
    // revoke: true ensures it is permanently deleted
    await client.deleteMessages("me", [parseInt(messageId as string, 10)], {
      revoke: true,
    });

    // 2. Delete from MongoDB
    await Message.findOneAndDelete({ messageId });

    return res.json({ ok: true, message: "Message deleted successfully" });
  } catch (err) {
    console.error("deleteMessage error", err);
    return res.status(500).json({ error: "Failed to delete message" });
  }
}
