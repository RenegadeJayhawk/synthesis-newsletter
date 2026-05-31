import { randomUUID, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type Store = Map<string, RateLimitEntry>;

const globalStore = globalThis as typeof globalThis & {
  __synthesisRateLimitStore?: Store;
};

const rateLimitStore = globalStore.__synthesisRateLimitStore ?? new Map<string, RateLimitEntry>();
globalStore.__synthesisRateLimitStore = rateLimitStore;

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

function secureEquals(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function createRequestId(): string {
  return randomUUID();
}

export function applyRateLimit(request: Request, options: RateLimitOptions): NextResponse | null {
  const now = Date.now();
  const ip = getClientIp(request);
  const entryKey = `${options.key}:${ip}`;
  const entry = rateLimitStore.get(entryKey);

  if (!entry || now >= entry.resetAt) {
    rateLimitStore.set(entryKey, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return null;
  }

  entry.count += 1;

  if (entry.count > options.limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    return NextResponse.json(
      {
        success: false,
        error: 'Too many requests. Please try again later.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfterSeconds.toString(),
        },
      }
    );
  }

  return null;
}

export function requireBearerToken(request: Request, envVarName: string): NextResponse | null {
  const expectedToken = process.env[envVarName];
  if (!expectedToken) {
    return NextResponse.json(
      {
        success: false,
        error: 'Service unavailable.',
      },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get('authorization') || '';
  const bearerPrefix = 'Bearer ';
  if (!authHeader.startsWith(bearerPrefix)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized.',
      },
      { status: 401 }
    );
  }

  const token = authHeader.slice(bearerPrefix.length).trim();
  if (!secureEquals(token, expectedToken)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized.',
      },
      { status: 401 }
    );
  }

  return null;
}

export function validateSecretValue(providedValue: string, envVarName: string): 'ok' | 'missing' | 'invalid' {
  const expectedValue = process.env[envVarName];
  if (!expectedValue) {
    return 'missing';
  }

  if (!providedValue || !secureEquals(providedValue, expectedValue)) {
    return 'invalid';
  }

  return 'ok';
}
