import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

export async function createClientFromStringSession(
  sessionString: string,
  apiId: number,
  apiHash: string,
  options: Record<string, any> = {},
): Promise<{ client: TelegramClient; session: StringSession }> {
  const session = new StringSession(sessionString || "");
  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
    ...options,
  });
  await client.connect();
  return { client, session };
}

export async function createEmptyClient(
  apiId: number,
  apiHash: string,
  options: Record<string, any> = {},
): Promise<{ client: TelegramClient; session: StringSession }> {
  const session = new StringSession("");
  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
    ...options,
  });
  await client.connect();
  return { client, session };
}
