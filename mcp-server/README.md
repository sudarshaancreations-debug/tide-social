# Tide Social MCP Server 🌊

Model Context Protocol (MCP) server for **Tide Social** (the combined Buffer + Ootto.ai social publishing platform).

Connect this MCP server to **Claude Desktop**, **Claude Code**, **Google Antigravity**, **ChatGPT**, **Cursor**, and other LLM clients to automate:
- Connecting unlimited social accounts ($N$ handles across Instagram, LinkedIn, TikTok, Threads, X, YouTube, etc.)
- Generating brand-aligned social content concepts and hooks (Ootto.ai engine)
- Scheduling posts with preflight media validation
- Approving and requesting revisions on pending drafts
- Reading and replying to unified comments & DMs with brand voice
- Monitoring channel health, token status, and cross-platform analytics

---

## 🛠 Available MCP Tools

| Tool Name | Description |
| :--- | :--- |
| `tide_list_accounts` | List all connected accounts with real-time health and token validity. |
| `tide_connect_account` | Connect any number of handles across 12 platforms. |
| `tide_disconnect_account` | Disconnect an account handle. |
| `tide_generate_concepts` | Generate multi-channel creative angles, hooks, and formats from any prompt or URL. |
| `tide_schedule_post` | Schedule post copy across selected channels with date and time. |
| `tide_list_scheduled_posts` | View the full publishing queue and scheduled calendar. |
| `tide_list_approvals` | List all drafts waiting for human approval. |
| `tide_approve_draft` | Approve a draft and move it into the live publishing calendar. |
| `tide_request_change` | Request specific revisions on a draft. |
| `tide_get_inbox` | Retrieve comments and DMs across platforms with lead intent tags. |
| `tide_reply_to_message` | Send a brand-voice reply to a comment or DM and mark as resolved. |
| `tide_get_analytics` | Retrieve 7-day and 30-day reach, engagement, top content, and leads. |
| `tide_get_brand_brain` | Inspect current Brand Brain guidelines, guardrails, and aesthetic rules. |
| `tide_update_brand_brain` | Update brand voice rules, guardrails, or visual aesthetic guidelines. |

---

## 🚀 Client Configurations

### 1. Claude Desktop
Add this to your `claude_desktop_config.json`:
* **macOS Path**: `~/Library/Application Support/Claude/claude_desktop_config.json`
* **Windows Path**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "tide-social": {
      "command": "node",
      "args": [
        "/Users/darshaananvekar/Documents/Codex/2026-10-23/https-buffer-com-https-buffer-com/outputs/tide-social/mcp-server/index.js"
      ]
    }
  }
}
```

---

### 2. Google Antigravity
Add to your Antigravity MCP settings (`~/.gemini/antigravity/mcp_config.json` or workspace settings):

```json
{
  "mcpServers": {
    "tide-social": {
      "command": "node",
      "args": [
        "/Users/darshaananvekar/Documents/Codex/2026-10-23/https-buffer-com-https-buffer-com/outputs/tide-social/mcp-server/index.js"
      ],
      "env": {}
    }
  }
}
```

---

### 3. Claude Code CLI
Add directly via Claude Code:

```bash
claude mcp add tide-social -- node /Users/darshaananvekar/Documents/Codex/2026-10-23/https-buffer-com-https-buffer-com/outputs/tide-social/mcp-server/index.js
```

---

### 4. ChatGPT (Custom GPTs / Actions)
ChatGPT connects via HTTP using the included REST server and OpenAPI 3.1 specification:

1. **Start the Tide HTTP Server**:
   ```bash
   cd mcp-server
   node http-server.js
   ```
   *(Runs on `http://localhost:3100`)*

2. In ChatGPT:
   - Go to **Explore GPTs** -> **Create a GPT** -> **Configure** -> **Actions** -> **Create new action**.
   - Paste the contents of `openapi.json` (or import from `http://localhost:3100/openapi.json`).
   - ChatGPT can now directly schedule posts, generate concepts, and review analytics!

---

### 5. Cursor / Windsurf / VS Code
Add to `.cursor/mcp.json` or your editor's MCP config:

```json
{
  "mcpServers": {
    "tide-social": {
      "command": "node",
      "args": [
        "/Users/darshaananvekar/Documents/Codex/2026-10-23/https-buffer-com-https-buffer-com/outputs/tide-social/mcp-server/index.js"
      ]
    }
  }
}
```

---

## 🧪 Testing

To run the test suite:
```bash
node test-mcp.cjs
```
