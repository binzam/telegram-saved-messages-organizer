import {
  createHash,
  randomBytes,
  createCipheriv,
  createDecipheriv,
} from "crypto";

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getKey() {
  const secret = process.env.SESSION_SECRET || "secret_1234";
  return createHash("sha256").update(String(secret)).digest();
}
/**
 * Encrypts a string using AES-256-GCM.
 * Returns a base64 string containing: [IV][TAG][CIPHERTEXT]
 */
function encrypt(text: string): string {
  const iv = randomBytes(IV_LENGTH);
  const key = getKey();
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}
/**
 * Decrypts a base64 string encrypted with the logic above.
 */
function decrypt(enc: string) {
  const data = Buffer.from(enc, "base64");
  const iv = data.subarray(0, IV_LENGTH);
  const tag = data.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ciphertext = data.subarray(IV_LENGTH + TAG_LENGTH);

  const key = getKey();
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

export { encrypt, decrypt };
