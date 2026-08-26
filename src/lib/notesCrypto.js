// Client-side encryption for Case Notes.
//
// Notes are encrypted in the browser with AES-GCM before they are sent to
// Supabase, so the database only ever stores ciphertext. The encryption key is
// derived from the case passcode (which is NEVER stored) via PBKDF2, so a
// database leak alone cannot decrypt anything without also knowing the passcode.

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64(bytes) {
  let s = '';
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s);
}
function fromB64(str) {
  const s = atob(str);
  const arr = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) arr[i] = s.charCodeAt(i);
  return arr;
}

export function generateSalt() {
  return b64(crypto.getRandomValues(new Uint8Array(16)));
}

// Derive an AES-GCM key from the passcode + salt.
export async function deriveKey(passcode, salt) {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(passcode),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode('bcvh:' + salt), iterations: 200000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// A validation hash of the passcode (so we never store the passcode itself).
export async function hashPasscode(passcode, salt) {
  const data = enc.encode('bcvh-auth:' + salt + ':' + passcode);
  const h = await crypto.subtle.digest('SHA-256', data);
  return b64(new Uint8Array(h));
}

// Encrypt a JS value → a JSON envelope string for the `content` column.
export async function encryptJSON(value, key) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(JSON.stringify(value))
  );
  return JSON.stringify({ v: 1, iv: b64(iv), ct: b64(new Uint8Array(ct)) });
}

// True if a `content` string is one of our encrypted envelopes.
export function isEncrypted(content) {
  if (!content || typeof content !== 'string') return false;
  try {
    const o = JSON.parse(content);
    return o && o.v === 1 && typeof o.iv === 'string' && typeof o.ct === 'string';
  } catch {
    return false;
  }
}

// Decrypt an envelope back to its JS value.
export async function decryptJSON(content, key) {
  const env = JSON.parse(content);
  const pt = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromB64(env.iv) },
    key,
    fromB64(env.ct)
  );
  return JSON.parse(dec.decode(pt));
}
