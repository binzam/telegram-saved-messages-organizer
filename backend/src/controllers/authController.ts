import { Request, Response } from "express";
import Message from "../models/Message.js";
import Session from "../models/Session.js";
import telegramService from "../services/telegramService.js";
import { encrypt } from "../utils/crypto.js";
import { clearAllSessions } from "../utils/scripts.js";
import {
  createEmptyClient,
  createClientFromStringSession,
} from "../utils/telegramClient.js";
import { Api } from "telegram";
import Task from "../models/Task.js";

const apiId = parseInt(process.env.TELEGRAM_API_ID || "0", 10);
const apiHash = process.env.TELEGRAM_API_HASH || "";
const BOT_USERNAME = process.env.TELEGRAM_BOT || "";

interface PendingAuth {
  phoneCodeHash: string;
  sessionString: string;
}

// In-memory temporary store for phoneCodeHash per phone
const pending = new Map<string, PendingAuth>();

export async function sendCode(req: Request, res: Response): Promise<Response> {
  const { phoneNumber } = req.body;
  if (!phoneNumber)
    return res.status(400).json({ error: "phoneNumber required" });

  console.log({ phoneNumber });
  try {
    const { client, session } = await createEmptyClient(apiId, apiHash);

    // sendCode returns a result with phoneCodeHash
    const sendResult = await client.sendCode(
      {
        apiId,
        apiHash,
      },
      phoneNumber,
    );

    pending.set(phoneNumber, {
      phoneCodeHash: sendResult.phoneCodeHash,
      sessionString: session.save() as unknown as string,
    });

    await client.disconnect();
    return res.json({ ok: true });
  } catch (err: any) {
    console.error("sendCode error", err);
    return res
      .status(500)
      .json({ error: "Failed to send code", detail: err.message });
  }
}

export async function verifyCode(
  req: Request,
  res: Response,
): Promise<Response> {
  const { phoneNumber, code } = req.body;
  if (!phoneNumber || !code)
    return res.status(400).json({ error: "phoneNumber and code required" });

  const record = pending.get(phoneNumber);
  if (!record)
    return res.status(400).json({ error: "No pending code for this number" });

  try {
    // RESUME the exact session state from sendCode
    const { client, session } = await createClientFromStringSession(
      record.sessionString,
      apiId,
      apiHash,
    );

    try {
      // Use the raw MTProto API call for the code step
      await client.invoke(
        new Api.auth.SignIn({
          phoneNumber,
          phoneCodeHash: record.phoneCodeHash,
          phoneCode: code,
        }),
      );
    } catch (e: any) {
      console.log("error in verify code", e);
      if (e.message && e.message.includes("SESSION_PASSWORD_NEEDED")) {
        // Update the stored session string because the internal state advanced
        pending.set(phoneNumber, {
          ...record,
          sessionString: session.save() as unknown as string,
        });
        await client.disconnect();
        return res.json({ mfa: true });
      }
      throw e;
    }
    const existingSession = await Session.findOne({ phoneNumber });
    // Get the user's own profile info (which includes their ID)
    const me = await client.getMe();
    const chatId = me.id.toString();

    // Only send the /start command if this is a brand new session/user
    if (!existingSession) {
      try {
        await client.sendMessage(BOT_USERNAME!, {
          message: "/start",
        });
        console.log(`✅ Sent init message to bot ${BOT_USERNAME}`);
      } catch (msgErr) {
        console.error(
          "⚠️ Failed to message bot, user might need to do it manually",
          msgErr,
        );
      }
    }
    // On success, save the final authorized session string
    const sessionString = session.save() as unknown as string;
    const encrypted = encrypt(sessionString);

    await Session.findOneAndUpdate(
      { phoneNumber },
      { phoneNumber, session: encrypted, chatId },
      { upsert: true },
    );

    await client.disconnect();
    pending.delete(phoneNumber);
    return res.json({ ok: true });
  } catch (err: any) {
    console.error("verifyCode error", err);
    return res
      .status(500)
      .json({ error: "Code verification failed", detail: err.message });
  }
}

export async function verifyPassword(
  req: Request,
  res: Response,
): Promise<Response> {
  const { phoneNumber, password } = req.body;
  if (!phoneNumber || !password)
    return res.status(400).json({ error: "phoneNumber and password required" });

  const record = pending.get(phoneNumber);
  if (!record)
    return res
      .status(400)
      .json({ error: "No pending auth flow for this number" });

  try {
    // Resume session one last time
    const { client, session } = await createClientFromStringSession(
      record.sessionString,
      apiId,
      apiHash,
    );

    // gram.js provides a helper that handles the complex SRP math for 2FA passwords
    await client.signInWithPassword(
      { apiId, apiHash },
      {
        password: async () => password,
        onError: (err: Error) => {
          throw err;
        },
      },
    );
    const existingSession = await Session.findOne({ phoneNumber });
    // Get the user's own profile info (which includes their ID)
    const me = await client.getMe();
    const chatId = me.id.toString();

    // Only send the /start command if this is a brand new session/user
    if (!existingSession) {
      try {
        await client.sendMessage(BOT_USERNAME!, {
          message: "/start",
        });
        console.log(`✅ Sent init message to bot ${BOT_USERNAME}`);
      } catch (msgErr) {
        console.error(
          "⚠️ Failed to message bot, user might need to do it manually",
          msgErr,
        );
      }
    }
    const sessionString = session.save() as unknown as string;
    const encrypted = encrypt(sessionString);

    await Session.findOneAndUpdate(
      { phoneNumber },
      { phoneNumber, session: encrypted, chatId },
      { upsert: true },
    );

    await client.disconnect();
    pending.delete(phoneNumber);
    return res.json({ ok: true });
  } catch (err: any) {
    console.error("verifyPassword error", err);
    return res
      .status(500)
      .json({ error: "Password verification failed", detail: err.message });
  }
}

export async function checkAuthStatus(
  req: Request,
  res: Response,
): Promise<Response> {
  try {
    const sess = await Session.findOne();
    if (sess && sess.session) {
      return res.json({ authed: true });
    }

    return res.json({ authed: false });
  } catch (err) {
    console.error("checkAuthStatus error", err);
    return res.status(500).json({ error: "Failed to check auth status" });
  }
}

export async function logout(req: Request, res: Response): Promise<Response> {
  const { wipe } = req.query;

  try {
    await clearAllSessions();
    await telegramService.disconnect();

    if (wipe === "true") {
      await Message.deleteMany({});
      await Task.deleteMany({});
      console.log("All Messages & Tasks wiped");
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("logout error", err);
    return res.status(500).json({ error: "Failed to logout" });
  }
}
