import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { applyRateLimit, createRequestId, validateSecretValue, requireBearerToken, requireApiSecret } from './apiSecurity';

describe('apiSecurity utilities', () => {
  describe('createRequestId', () => {
    it('should generate a valid UUID', () => {
      const id1 = createRequestId();
      const id2 = createRequestId();
      expect(id1).toBeTypeOf('string');
      expect(id1.length).toBe(36);
      expect(id1).not.toBe(id2);
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(id1).toSatisfy((val) => uuidRegex.test(val as string));
    });
  });

  describe('validateSecretValue', () => {
    const envVar = 'TEST_SECRET_VAR';

    beforeEach(() => {
      vi.stubEnv(envVar, 'my-super-secret');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('should return missing when env var is not configured', () => {
      vi.unstubAllEnvs();
      const result = validateSecretValue('some-value', envVar);
      expect(result).toBe('missing');
    });

    it('should return invalid when provided value is wrong', () => {
      const result = validateSecretValue('wrong-secret', envVar);
      expect(result).toBe('invalid');
    });

    it('should return ok when values match', () => {
      const result = validateSecretValue('my-super-secret', envVar);
      expect(result).toBe('ok');
    });
  });

  describe('requireBearerToken', () => {
    const envVar = 'NEWSLETTER_ADMIN_TOKEN';

    beforeEach(() => {
      vi.stubEnv(envVar, 'admin-token-123');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('should return 503 response if environment token is missing', () => {
      vi.unstubAllEnvs();
      const request = new Request('http://localhost/api/test', {
        headers: { authorization: 'Bearer admin-token-123' },
      });
      const response = requireBearerToken(request, envVar);
      expect(response).not.toBeNull();
      expect(response?.status).toBe(503);
    });

    it('should return 401 response if authorization header is missing', () => {
      const request = new Request('http://localhost/api/test');
      const response = requireBearerToken(request, envVar);
      expect(response).not.toBeNull();
      expect(response?.status).toBe(401);
    });

    it('should return 401 response if header is not Bearer format', () => {
      const request = new Request('http://localhost/api/test', {
        headers: { authorization: 'Basic YWRtaW46cGFzcw==' },
      });
      const response = requireBearerToken(request, envVar);
      expect(response).not.toBeNull();
      expect(response?.status).toBe(401);
    });

    it('should return 401 response if token is invalid', () => {
      const request = new Request('http://localhost/api/test', {
        headers: { authorization: 'Bearer invalid-token' },
      });
      const response = requireBearerToken(request, envVar);
      expect(response).not.toBeNull();
      expect(response?.status).toBe(401);
    });

    it('should return null if token is valid', () => {
      const request = new Request('http://localhost/api/test', {
        headers: { authorization: 'Bearer admin-token-123' },
      });
      const response = requireBearerToken(request, envVar);
      expect(response).toBeNull();
    });
  });

  describe('requireApiSecret', () => {
    beforeEach(() => {
      vi.stubEnv('NEWSLETTER_INGEST_TOKEN', 'ingest-secret-123');
      vi.stubEnv('NEWSLETTER_ADMIN_TOKEN', 'admin-backup-456');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('returns 503 if none of the specified env vars are set', () => {
      vi.unstubAllEnvs();
      const request = new Request('http://localhost/api/test', {
        headers: { authorization: 'Bearer ingest-secret-123' },
      });
      const response = requireApiSecret(request, ['NEWSLETTER_INGEST_TOKEN', 'NEWSLETTER_ADMIN_TOKEN']);
      expect(response?.status).toBe(503);
    });

    it('returns 401 if no auth header or x-api-key is present', () => {
      const request = new Request('http://localhost/api/test');
      const response = requireApiSecret(request, ['NEWSLETTER_INGEST_TOKEN']);
      expect(response?.status).toBe(401);
    });

    it('returns 401 if bearer token does not match', () => {
      const request = new Request('http://localhost/api/test', {
        headers: { authorization: 'Bearer wrong-secret' },
      });
      const response = requireApiSecret(request, ['NEWSLETTER_INGEST_TOKEN']);
      expect(response?.status).toBe(401);
    });

    it('authorizes when valid bearer token matches primary secret', () => {
      const request = new Request('http://localhost/api/test', {
        headers: { authorization: 'Bearer ingest-secret-123' },
      });
      const response = requireApiSecret(request, ['NEWSLETTER_INGEST_TOKEN', 'NEWSLETTER_ADMIN_TOKEN']);
      expect(response).toBeNull();
    });

    it('authorizes when valid bearer token matches fallback secret', () => {
      const request = new Request('http://localhost/api/test', {
        headers: { authorization: 'Bearer admin-backup-456' },
      });
      const response = requireApiSecret(request, ['NEWSLETTER_INGEST_TOKEN', 'NEWSLETTER_ADMIN_TOKEN']);
      expect(response).toBeNull();
    });

    it('authorizes with x-api-key header', () => {
      const request = new Request('http://localhost/api/test', {
        headers: { 'x-api-key': 'ingest-secret-123' },
      });
      const response = requireApiSecret(request, 'NEWSLETTER_INGEST_TOKEN');
      expect(response).toBeNull();
    });
  });

  describe('applyRateLimit', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-06-15T12:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    it('tracks requests by x-forwarded-for and returns retry-after when the limit is exceeded', () => {
      const request = new Request('http://localhost/api/test', {
        headers: {
          'x-forwarded-for': '203.0.113.10, 10.0.0.1',
        },
      });

      expect(
        applyRateLimit(request, {
          key: 'forwarded-rate-limit',
          limit: 1,
          windowMs: 60_000,
        })
      ).toBeNull();

      const response = applyRateLimit(request, {
        key: 'forwarded-rate-limit',
        limit: 1,
        windowMs: 60_000,
      });

      expect(response).not.toBeNull();
      expect(response?.status).toBe(429);
      expect(response?.headers.get('Retry-After')).toBe('60');
    });

    it('falls back to x-real-ip when x-forwarded-for is absent', () => {
      const request = new Request('http://localhost/api/test', {
        headers: {
          'x-real-ip': '198.51.100.22',
        },
      });

      expect(
        applyRateLimit(request, {
          key: 'real-ip-rate-limit',
          limit: 1,
          windowMs: 60_000,
        })
      ).toBeNull();

      const response = applyRateLimit(request, {
        key: 'real-ip-rate-limit',
        limit: 1,
        windowMs: 60_000,
      });

      expect(response).not.toBeNull();
      expect(response?.status).toBe(429);
      expect(response?.headers.get('Retry-After')).toBe('60');
    });
  });
});
