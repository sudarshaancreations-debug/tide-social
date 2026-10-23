const assert = require('node:assert/strict');
const path = require('path');
const { loadState, saveState, core } = require('./state.js');

console.log('--- Testing Tide MCP Server & Core Skills Integration ---');

// Test 1: State Loading
const state = loadState();
assert.ok(Array.isArray(state.accounts), 'Accounts should be an array');
assert.ok(state.accounts.length >= 4, 'Should have at least 4 seed accounts');
assert.ok(state.brand.voice, 'Should have brand voice');
console.log('✓ State loading test passed');

// Test 2: Core Concept Generation
const concepts = core.generateConcepts('Founder-led growth');
assert.equal(concepts.length, 3, 'Should generate 3 concepts');
console.log('✓ Concept generation test passed');

// Test 3: Post Creation
const postRes = core.createPost('Mastering content velocity without burnout.', ['Instagram', 'LinkedIn'], '2026-10-27', '14:00');
assert.equal(postRes.valid, true, 'Post should be valid');
console.log('✓ Post creation test passed');

// Test 4: Media Preflight Check
const mediaRes = core.validateMedia({ size: 8 * 1024 * 1024, type: 'video/mp4' });
assert.equal(mediaRes.valid, true, 'Media should pass validation');
console.log('✓ Media preflight test passed');

// Test 5: Hormozi Hooks Skill
const hooks = core.generateHormoziHooks('social distribution');
assert.equal(hooks.length, 5, 'Should generate 5 Hormozi hooks');
assert.ok(hooks[0].why, 'Hook should have why');
console.log('✓ Hormozi hooks skill test passed');

// Test 6: 1-to-5 Content Repurposer Skill
const rep = core.repurposeContent('Our weekly planning ritual that cut drafting time by 60%.');
assert.equal(rep.formats.length, 4, 'Should generate 4 native formats');
console.log('✓ Content repurposer skill test passed');

// Test 7: Video Storyboarder Skill
const board = core.generateVideoStoryboard('Customer Acquisition');
assert.equal(board.scenes.length, 3, 'Should have 3 scenes');
console.log('✓ Video storyboarder skill test passed');

console.log('All MCP unit, state, and skill integration checks passed successfully!');
