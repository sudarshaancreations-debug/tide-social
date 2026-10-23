const assert = require('node:assert/strict');
const path = require('path');
const { loadState, saveState, core } = require('./state.js');

console.log('--- Testing Tide MCP Server & Core Integration ---');

// Test 1: State Loading
const state = loadState();
assert.ok(Array.isArray(state.accounts), 'Accounts should be an array');
assert.ok(state.accounts.length >= 4, 'Should have at least 4 seed accounts');
assert.ok(state.brand.voice, 'Should have brand voice');
console.log('✓ State loading test passed');

// Test 2: Core Concept Generation via MCP tool logic
const concepts = core.generateConcepts('Founder-led growth');
assert.equal(concepts.length, 3, 'Should generate 3 concepts');
assert.ok(concepts[0].title, 'Concept should have title');
assert.ok(concepts[0].format, 'Concept should have format');
console.log('✓ Concept generation test passed');

// Test 3: Post Creation via MCP tool logic
const postRes = core.createPost('Mastering content velocity without burnout.', ['Instagram', 'LinkedIn'], '2026-10-27', '14:00');
assert.equal(postRes.valid, true, 'Post should be valid');
assert.equal(postRes.post.channels.length, 2, 'Should target 2 channels');
console.log('✓ Post creation test passed');

// Test 4: Media Preflight Check
const mediaRes = core.validateMedia({ size: 8 * 1024 * 1024, type: 'video/mp4' });
assert.equal(mediaRes.valid, true, 'Media should pass validation');
console.log('✓ Media preflight test passed');

console.log('All MCP unit and state validation checks passed!');
