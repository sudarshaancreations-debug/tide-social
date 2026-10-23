const assert = require('node:assert/strict');
const {
  supportedPlatforms,
  normalizeHandle,
  validateAccount,
  createPost,
  validateMedia,
  rewriteCopy,
  generateConcepts,
  generateHormoziHooks,
  repurposeContent,
  generateVideoStoryboard
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

// Hormozi Hooks Skill Test
const hooks = generateHormoziHooks('cold email outreach');
assert.equal(hooks.length, 5);
assert.ok(hooks[0].hook.includes('cold email outreach'));
assert.ok(hooks[0].why.length > 5);

// Repurposer Skill Test
const rep = repurposeContent('Scaling customer retention without bloated customer support tickets.');
assert.equal(rep.formats.length, 4);
assert.equal(rep.formats[0].platform, 'Instagram');
assert.equal(rep.formats[1].platform, 'LinkedIn');

// Storyboard Skill Test
const story = generateVideoStoryboard('Organic Growth');
assert.equal(story.scenes.length, 3);
assert.equal(story.scenes[0].timestamp, '00:00 - 00:03');

console.log('All core skills tests passed (Hormozi Hooks, 1-to-5 Repurposer, Video Storyboarder)!');
