#!/usr/bin/env node

const http = require('http');
const url = require('url');
const { loadState, saveState, core } = require('./state.js');

const PORT = process.env.PORT || 3100;

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data, null, 2));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  const state = loadState();

  try {
    // API Spec for ChatGPT
    if (pathname === '/openapi.json' && method === 'GET') {
      const spec = require('./openapi.json');
      return sendJson(res, 200, spec);
    }

    // Health
    if (pathname === '/health' && method === 'GET') {
      return sendJson(res, 200, { status: 'healthy', version: '1.0.0', service: 'Tide Social API & MCP' });
    }

    // Accounts
    if (pathname === '/api/accounts' && method === 'GET') {
      return sendJson(res, 200, { total: state.accounts.length, accounts: state.accounts });
    }

    if (pathname === '/api/accounts' && method === 'POST') {
      const body = await parseBody(req);
      const val = core.validateAccount(body.platform, body.handle);
      if (!val.valid) return sendJson(res, 400, { error: val.error });

      const newAccount = {
        platform: body.platform,
        handle: val.handle,
        audience: '0 followers (New)',
        cls: body.platform.toLowerCase().slice(0, 2),
        status: 'Healthy',
        tokenExpires: '90 days',
        workspace: body.workspace || 'ACME Studio'
      };
      state.accounts.push(newAccount);
      saveState(state);
      return sendJson(res, 201, { message: `Connected ${val.handle}`, account: newAccount });
    }

    // Concepts
    if (pathname === '/api/concepts/generate' && method === 'POST') {
      const body = await parseBody(req);
      const concepts = core.generateConcepts(body.prompt);
      return sendJson(res, 200, { prompt: body.prompt, concepts });
    }

    // Posts & Scheduling
    if (pathname === '/api/posts' && method === 'GET') {
      return sendJson(res, 200, { total: state.scheduled.length, posts: state.scheduled });
    }

    if (pathname === '/api/posts' && method === 'POST') {
      const body = await parseBody(req);
      const val = core.createPost(body.copy, body.channels, body.date, body.time);
      if (!val.valid) return sendJson(res, 400, { error: val.error });

      const newPost = {
        ...val.post,
        title: val.post.copy.slice(0, 48),
        meta: body.channels.join(' · '),
        cls: body.channels[0].toLowerCase().slice(0, 2)
      };
      state.scheduled.unshift(newPost);
      saveState(state);
      return sendJson(res, 201, { message: 'Post scheduled', post: newPost });
    }

    // Approvals
    if (pathname === '/api/approvals' && method === 'GET') {
      return sendJson(res, 200, { total: state.approvals.length, drafts: state.approvals });
    }

    if (pathname.startsWith('/api/approvals/') && pathname.endsWith('/approve') && method === 'POST') {
      const draftId = pathname.split('/')[3];
      const draft = state.approvals.find(a => a.id === draftId);
      if (!draft) return sendJson(res, 404, { error: 'Draft not found' });

      state.approvals = state.approvals.filter(a => a.id !== draftId);
      state.scheduled.unshift({
        id: Date.now(),
        time: '11:00',
        date: '2026-10-26',
        title: draft.title,
        channels: [draft.platform],
        meta: `${draft.platform} · Approved`,
        cls: draft.cls,
        copy: draft.kicker
      });
      saveState(state);
      return sendJson(res, 200, { message: `Draft "${draft.title}" approved and scheduled.` });
    }

    // Inbox
    if (pathname === '/api/inbox' && method === 'GET') {
      return sendJson(res, 200, { threads: state.threads });
    }

    if (pathname.startsWith('/api/inbox/') && pathname.endsWith('/reply') && method === 'POST') {
      const threadId = pathname.split('/')[3];
      const body = await parseBody(req);
      const thread = state.threads.find(t => t.id === threadId);
      if (!thread) return sendJson(res, 404, { error: 'Conversation thread not found' });

      thread.replies = thread.replies || [];
      thread.replies.push({ text: body.reply_text, time: 'Just now' });
      thread.handled = true;
      saveState(state);
      return sendJson(res, 200, { message: `Reply sent to ${thread.name}` });
    }

    // Analytics
    if (pathname === '/api/analytics' && method === 'GET') {
      return sendJson(res, 200, state.analytics);
    }

    // Brand Brain
    if (pathname === '/api/brand' && method === 'GET') {
      return sendJson(res, 200, state.brand);
    }

    sendJson(res, 404, { error: 'Route not found' });
  } catch (err) {
    sendJson(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`Tide Social HTTP API & ChatGPT Action Server listening on http://localhost:${PORT}`);
  console.log(`OpenAPI schema available at: http://localhost:${PORT}/openapi.json`);
});
