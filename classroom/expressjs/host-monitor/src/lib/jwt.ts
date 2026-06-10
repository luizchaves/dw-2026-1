import { createHmac } from 'node:crypto';

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
