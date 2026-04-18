import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

async function createClientFromStringSession(
  sessionString,
  apiId,
  apiHash,
  options = {},
) {
  const session = new StringSession(sessionString || "");
  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
    ...options,
  });
  await client.connect();
  return { client, session };
}

async function createEmptyClient(apiId, apiHash, options = {}) {
  const session = new StringSession("");
  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
    ...options,
  });
  await client.connect();
  return { client, session };
}

export { createClientFromStringSession, createEmptyClient };
