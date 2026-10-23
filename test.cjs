const assert = require('node:assert/strict');
const {
  supportedPlatforms,
  normalizeHandle,
  validateAccount,
  createPost,
  validateMedia,
  rewriteCopy,
  generateConcepts
} = require('./core.js');

assert.equal(supportedPlatforms.length, 12);
assert.equal(normalizeHandle('acme.studio'), '@acme.studio');
assert.deepEqual(validateAccount('Instagram', 'acme.studio'), { valid: true, handle: '@acme.studio' });
assert.equal(validateAccount('MySpace', '@acme').valid, false);
assert.equal(validateAccount('LinkedIn', 'x').valid, false);
assert.equal(createPost('', ['Instagram'], '2026-10-26', '10:30').valid, false);
assert.equal(createPost('Hello', [], '2026-10-26', '10:30').valid, false);
assert.equal(createPost('Hello', ['Instagram'], '2026-10-26', '10:30').post.status, 'scheduled');

// Validate Media tests
assert.equal(validateMedia(null).valid, false);
assert.equal(validateMedia({ size: 200 * 1024 * 1024, type: 'video/mp4' }).valid, false);
assert.equal(validateMedia({ size: 15 * 1024 * 1024, type: 'application/pdf' }).valid, false);
const validMedia = validateMedia({ size: 12 * 1024 * 1024, type: 'video/mp4' });
assert.equal(validMedia.valid, true);
assert.equal(validMedia.sizeMB, '12.0');

// Rewrite tests
const hooked = rewriteCopy('Build better workflows.', 'add_hook');
assert.match(hooked, /Most people get this backwards:/);

const shortened = rewriteCopy('First sentence.\nSecond line.\nThird line which is longer.', 'shorten');
assert.ok(shortened.length < 100);

// Concept generation test
const concepts = generateConcepts('growth marketing');
assert.equal(concepts.length, 3);
assert.match(concepts[0].title, /growth marketing/);

console.log('All Tide core unit and integration checks passed successfully!');
