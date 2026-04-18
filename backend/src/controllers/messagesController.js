import Message from "../models/Message.js";
import { decrypt } from "../utils/crypto.js";
import { createClientFromStringSession } from "../utils/telegramClient.js";
import telegramService from "../services/telegramService.js";
import { normalizeMessage } from "../utils/normalizeMessage.js";

const apiId = parseInt(process.env.TELEGRAM_API_ID || "0", 10);
const apiHash = process.env.TELEGRAM_API_HASH || "";


// --- ENDPOINT: Fetch Messages (with Smart Sync) ---
export async function getMessages(req, res) {
  const { tag, type, page = 1, limit = 20 } = req.query;
  // console.log("query", req.query);
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  try {
    // Build query dynamically based on request filters
    const query = {};
    if (tag) query.$or = [{ autoTags: tag }, { userTags: tag }];
    if (type) query.type = type;

    let currentTotal = await Message.countDocuments(query);

    // Smart Sync: Fetch from Telegram if on page 1 OR running out of DB cache
    if (pageNum === 1 || skip + limitNum >= currentTotal) {
      const sess = req.sessionDoc;
      if (sess && sess.session) {
        const sessionString = decrypt(sess.session);

        const client = await telegramService.init(sessionString);

        let fetchOptions = { limit: 100 };

        if (pageNum > 1) {
          const oldestMsg = await Message.findOne().sort({ date: 1 });
          if (oldestMsg)
            fetchOptions.offsetId = parseInt(oldestMsg.messageId, 10);
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

    // Query local DB
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
// --- ENDPOINT: Stream Media ---
export async function getMedia(req, res) {
  const { messageId } = req.params;

  try {
    const sessionString = decrypt(req.sessionDoc.session);
    const client = await telegramService.init(sessionString);

    const messages = await client.getMessages("me", {
      ids: [parseInt(messageId, 10)],
    });

    if (!messages || messages.length === 0 || !messages[0].media) {
      return res.status(404).json({ error: "Media not found" });
    }

    const buffer = await client.downloadMedia(messages[0]);

    if (!buffer)
      return res.status(404).json({ error: "Could not download media" });

    // Set correct headers based on MTProto payload
    if (messages[0].media?.document?.mimeType) {
      res.setHeader("Content-Type", messages[0].media.document.mimeType);
    } else if (messages[0].media?.className === "MessageMediaPhoto") {
      res.setHeader("Content-Type", "image/jpeg");
    }

    // Add cache-control so the frontend doesn't re-download images constantly
    res.setHeader("Cache-Control", "public, max-age=31536000");

    return res.send(buffer);
  } catch (err) {
    console.error("getMedia error", err);
    res.status(500).json({ error: "Failed to stream media" });
  }
}

// --- ENDPOINT: Add Custom User Tags ---
export async function tagMessage(req, res) {
  const { messageId, tags } = req.body;
  if (!messageId || !Array.isArray(tags)) {
    return res.status(400).json({ error: "messageId and tags[] required" });
  }

  try {
    // Only update userTags, leaving autoTags completely separate
    const doc = await Message.findOneAndUpdate(
      { messageId },
      { $addToSet: { userTags: { $each: tags } }, updatedAt: new Date() },
      { new: true, upsert: true }, // Creates the doc if it doesn't exist locally yet
    );
    return res.json({ ok: true, message: doc });
  } catch (err) {
    console.error("tagMessage error", err);
    return res.status(500).json({ error: "Failed to tag message" });
  }
}
