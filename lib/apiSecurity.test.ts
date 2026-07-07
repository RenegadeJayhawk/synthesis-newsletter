import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRequestId, validateSecretValue, requireBearerToken } from './apiSecurity';

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
});
