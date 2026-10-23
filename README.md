# Tide Social 🌊

An interactive full-stack prototype combining Buffer's multi-platform publishing workflow with Ootto.ai's AI-assisted creative studio and brand engine.

- **Live Production URL**: [https://tide-social.vercel.app](https://tide-social.vercel.app)
- **GitHub Repository**: [https://github.com/sudarshaancreations-debug/tide-social](https://github.com/sudarshaancreations-debug/tide-social)
- **MCP Server Directory**: [`mcp-server/`](./mcp-server/)

---

## ⚡ Key Highlights

- **Unlimited Accounts ($N$ Handles)**: Connect as many Instagram handles, LinkedIn pages/profiles, TikTok accounts, Threads, X, YouTube, and 6 more platforms as you need.
- **Ootto.ai Creative Brain**: Turn single thoughts, URLs, or top-performing posts into multi-format concepts (Reels, Carousels, Shorts, LinkedIn posts) respecting brand voice guardrails.
- **Media Preflight Engine**: Automatic checks for aspect ratio (9:16 / 1:1 / 16:9), format, file size, and duration before scheduling.
- **Human-in-the-Loop Approvals**: Review drafts, request revisions with specific notes, and maintain full edit history.
- **Unified Inbox**: Real-time comment & DM triage across platforms with AI response drafts and qualified lead detection.
- **Compliance Suite**: Granular cookie banner and full Privacy, Cookie, Terms, and Security policy modals.
- **Model Context Protocol (MCP)**: Connect Tide Social to Claude, Antigravity, ChatGPT, and Cursor via [`mcp-server/`](./mcp-server/).

---

## 🚀 Running Locally

```bash
# Start frontend preview
python3 -m http.server 4173
```
Open `http://localhost:4173`.

### Running the MCP Server
```bash
cd mcp-server
npm install
node index.js
```

### Running the HTTP API / ChatGPT Server
```bash
cd mcp-server
node http-server.js
```
OpenAPI documentation available at `http://localhost:3100/openapi.json`.
