import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { NewMessage, NewMessageEvent } from "telegram/events/index.js";
import { normalizeMessage } from "../utils/normalizeMessage.js";
import Message from "../models/Message.js";
import { socketService } from "./socketService.js";

const apiId = parseInt(process.env.TELEGRAM_API_ID || "0", 10);
const apiHash = process.env.TELEGRAM_API_HASH || "";

class TelegramService {
  public client: TelegramClient | null;
  public sessionString: string | null;
  public connecting: Promise<TelegramClient> | null;

  constructor() {
    this.client = null;
    this.sessionString = null;
    this.connecting = null;
  }

  async init(sessionString: string): Promise<TelegramClient> {
    if (this.client && this.sessionString === sessionString) {
      return this.client;
    }

    if (this.connecting) {
      return this.connecting;
    }

    this.connecting = this._connect(sessionString);
    const client = await this.connecting;
    this.connecting = null;

    return client;
  }

  private async _connect(sessionString: string): Promise<TelegramClient> {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
    }

    const session = new StringSession(sessionString || "");

    const client = new TelegramClient(session, apiId, apiHash, {
      connectionRetries: 5,
    });

    await client.connect();

    this.client = client;
    this.sessionString = sessionString;

    console.log("✅ Telegram client connected (singleton)");
    // Add Real-Time Listener for Saved Messages
    this.client.addEventHandler(
      this.handleNewMessage.bind(this),
      new NewMessage({ chats: ["me"] }), // Filters for "Saved Messages"
    );
    return client;
  }
  private async handleNewMessage(event: NewMessageEvent): Promise<void> {
    try {
      const message = event.message;

      // Normalize the raw GramJS message
      const normalizedMsg = normalizeMessage(message);

      // Save to MongoDB
      const savedDoc = await Message.findOneAndUpdate(
        { messageId: normalizedMsg.messageId },
        { $set: normalizedMsg },
        { upsert: true, new: true, lean: true },
      );

      // Broadcast to frontend
      const io = socketService.getIO();
      io.emit("new_saved_message", savedDoc);
    } catch (error) {
      console.error("❌ Error handling new Telegram message:", error);
    }
  }
  getClient(): TelegramClient {
    if (!this.client) {
      throw new Error("Telegram client not initialized");
    }
    return this.client;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
      this.sessionString = null;
    }
  }
}

const telegramService = new TelegramService();
export default telegramService;
