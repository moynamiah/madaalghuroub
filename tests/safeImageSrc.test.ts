import test from 'node:test';
import assert from 'node:assert/strict';
import { safeImageSrc } from '../src/utils/safeImageSrc.ts';

test('safeImageSrc allows valid HTTPS URLs, single-slash local paths, and raster base64 data URLs', () => {
  assert.equal(
    safeImageSrc('https://cdn.madaalghuroub.com/images/site-photo.webp'),
    'https://cdn.madaalghuroub.com/images/site-photo.webp'
  );
  assert.equal(
    safeImageSrc('/assets/moyna_miah_portrait_1791440206465-abc123.jpg'),
    '/assets/moyna_miah_portrait_1791440206465-abc123.jpg'
  );
  assert.equal(
    safeImageSrc('/madaalghuroub/assets/hero-xyz.webp'),
    '/madaalghuroub/assets/hero-xyz.webp'
  );

  const validPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  assert.equal(safeImageSrc(validPng), validPng);

  const validWebp = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
  assert.equal(safeImageSrc(validWebp), validWebp);
});

test('safeImageSrc blocks dangerous protocols, SVG/HTML data URLs, HTTP, scheme-relative URLs, traversal, control chars, and credentials', () => {
  const blockedInputs: unknown[] = [
    '',
    '   ',
    null,
    undefined,
    12345,
    {},
    'javascript:alert(1)',
    'JAVASCRIPT:alert(1)',
    'vbscript:msgbox(1)',
    'file:///etc/passwd',
    'blob:https://madaalghuroub.com/1234-5678',
    'http://madaalghuroub.com/logo.png',
    '//evil.example.com/tracker.png',
    'data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+PC9zdmc+',
    'data:image/svg+xml,<svg onload=alert(1)>',
    'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
    'data:image/png;base64,not valid base64!!!',
    '/assets/../../etc/passwd',
    '/assets\\evil.png',
    'https://user:pass@madaalghuroub.com/logo.png',
    'https://madaalghuroub.com/logo.png\r\nX-Injected: 1',
    '\u0000https://madaalghuroub.com/logo.png',
    'https://',
  ];

  for (const input of blockedInputs) {
    assert.equal(
      safeImageSrc(input),
      '',
      `Expected safeImageSrc to reject: ${JSON.stringify(input)}`
    );
  }
});

test('safeImageSrc enforces maximum data URL size limit', () => {
  const oversized = `data:image/jpeg;base64,${'A'.repeat(1024)}`;
  assert.equal(safeImageSrc(oversized, 512), '');
  assert.equal(safeImageSrc(oversized, 2048), oversized);
});
