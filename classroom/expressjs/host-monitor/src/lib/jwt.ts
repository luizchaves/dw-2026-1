import { createHmac, timingSafeEqual } from 'node:crypto';

type JwtPayload = {
  sub: string;
  name: string;
  email: string;
  iat: number;
  exp: number;
};

const DEFAULT_EXPIRES_IN_SECONDS = 60 * 60;

function getJwtSecret(): string {
  return process.env.JWT_SECRET ?? 'host-monitor-development-secret';
}

function encodeBase64Url(input: string | Buffer): string {
  return Buffer.from(input).toString('base64url');
}

function signPart(input: string): string {
  return createHmac('sha256', getJwtSecret()).update(input).digest('base64url');
}

function decodePart(input: string): unknown {
  return JSON.parse(Buffer.from(input, 'base64url').toString('utf8'));
}

function hasValidSignature(data: string, signature: string): boolean {
  const expectedSignature = signPart(data);
  const expectedBuffer = Buffer.from(expectedSignature);
  const signatureBuffer = Buffer.from(signature);

  return (
    expectedBuffer.length === signatureBuffer.length &&
    timingSafeEqual(expectedBuffer, signatureBuffer)
  );
}

function isJwtPayload(payload: unknown): payload is JwtPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'sub' in payload &&
    typeof payload.sub === 'string' &&
    'name' in payload &&
    typeof payload.name === 'string' &&
    'email' in payload &&
    typeof payload.email === 'string' &&
    'iat' in payload &&
    typeof payload.iat === 'number' &&
    'exp' in payload &&
    typeof payload.exp === 'number'
  );
}

export function signJwt(
  payload: Omit<JwtPayload, 'iat' | 'exp'>,
  expiresInSeconds = DEFAULT_EXPIRES_IN_SECONDS
): string {
  const now = Math.floor(Date.now() / 1000);
  const header = encodeBase64Url(
    JSON.stringify({
      alg: 'HS256',
      typ: 'JWT',
    })
  );
  const body = encodeBase64Url(
    JSON.stringify({
      ...payload,
      iat: now,
      exp: now + expiresInSeconds,
    })
  );
  const data = `${header}.${body}`;

  return `${data}.${signPart(data)}`;
}

export function verifyJwt(token: string): JwtPayload | null {
  const [header, body, signature, ...extraParts] = token.split('.');

  if (!header || !body || !signature || extraParts.length > 0) {
    return null;
  }

  const data = `${header}.${body}`;

  if (!hasValidSignature(data, signature)) {
    return null;
  }

  try {
    const payload = decodePart(body);

    if (!isJwtPayload(payload)) {
      return null;
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export type { JwtPayload };
