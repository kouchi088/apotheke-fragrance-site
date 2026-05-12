import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import {
  ADMIN_ACCESS_COOKIE_NAME,
  getAdminAccessCookieOptions,
  getBearerAccessToken,
} from './adminAccessCookie.ts';

const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  if (originalNodeEnv === undefined) {
    delete process.env.NODE_ENV;
    return;
  }

  process.env.NODE_ENV = originalNodeEnv;
});

test('extracts a bearer access token from an authorization header', () => {
  assert.equal(getBearerAccessToken('Bearer token-123'), 'token-123');
  assert.equal(getBearerAccessToken('Bearer   token-123  '), 'token-123');
  assert.equal(getBearerAccessToken('Basic token-123'), null);
  assert.equal(getBearerAccessToken(null), null);
});

test('uses a secure admin access cookie in production', () => {
  process.env.NODE_ENV = 'production';

  assert.equal(ADMIN_ACCESS_COOKIE_NAME, 'admin_access_token');
  assert.deepEqual(getAdminAccessCookieOptions(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 60 * 60,
  });
});

test('does not mark the admin access cookie secure outside production', () => {
  process.env.NODE_ENV = 'development';

  assert.equal(getAdminAccessCookieOptions().secure, false);
});
