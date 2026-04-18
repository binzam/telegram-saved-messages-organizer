import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

const apiId = parseInt(process.env.TELEGRAM_API_ID || "0", 10);
const apiHash = process.env.TELEGRAM_API_HASH || "";

class TelegramService {
  constructor() {
    this.client = null;
    this.sessionString = null;
    this.connecting = null; // prevents parallel connects
  }

  async init(sessionString) {
    // If already connected with same session → reuse
    if (this.client && this.sessionString === sessionString) {
      return this.client;
    }

    // If already connecting → wait for it
    if (this.connecting) {
      return this.connecting;
    }

    this.connecting = this._connect(sessionString);
    const client = await this.connecting;
    this.connecting = null;

    return client;
  }

  async _connect(sessionString) {
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

    return client;
  }

  getClient() {
    if (!this.client) {
      throw new Error("Telegram client not initialized");
    }
    return this.client;
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
      this.sessionString = null;
    }
  }
}

const telegramService = new TelegramService();

export default telegramService;
