#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const { loadState, saveState, core } = require('./state.js');

const server = new Server(
  {
    name: 'tide-social-mcp',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Define tool catalog
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'tide_list_accounts',
        description: 'List all connected social media accounts across Instagram, LinkedIn, TikTok, Threads, Facebook, YouTube, X, etc., along with their connection health and token validity.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'tide_connect_account',
        description: 'Connect a new social media account to Tide Social. Supports unlimited accounts and handles across 12 platforms.',
        inputSchema: {
          type: 'object',
          properties: {
            platform: {
              type: 'string',
              description: 'Platform name (Instagram, LinkedIn, TikTok, Facebook, Threads, X, YouTube, Pinterest, Bluesky, Mastodon, Google Business, Substack)'
            },
            handle: {
              type: 'string',
              description: 'Account handle or page name (e.g. @acmestudio or ACME Studio)'
            },
            workspace: {
              type: 'string',
              description: 'Optional workspace name (e.g. ACME Studio, Client Accounts)'
            }
          },
          required: ['platform', 'handle']
        }
      },
      {
        name: 'tide_disconnect_account',
        description: 'Disconnect a social media account handle from Tide Social.',
        inputSchema: {
          type: 'object',
          properties: {
            handle: {
              type: 'string',
              description: 'Account handle to disconnect (e.g. @acmestudio)'
            }
          },
          required: ['handle']
        }
      },
      {
        name: 'tide_generate_concepts',
        description: 'Generate brand-aligned content concepts, hooks, and formats for social channels from a prompt, topic, or URL using Tide Creative Studio.',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Idea, topic, or reference URL to turn into content concepts'
            }
          },
          required: ['prompt']
        }
      },
      {
        name: 'tide_schedule_post',
        description: 'Schedule a social media post across one or more connected channels with preflight validation.',
        inputSchema: {
          type: 'object',
          properties: {
            copy: {
              type: 'string',
              description: 'The body text or caption of the post'
            },
            channels: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of target channels (e.g. ["Instagram", "LinkedIn"])'
            },
            date: {
              type: 'string',
              description: 'Publish date in YYYY-MM-DD format (e.g. "2026-10-26")'
            },
            time: {
              type: 'string',
              description: 'Publish time in HH:MM 24h format (e.g. "10:30")'
            }
          },
          required: ['copy', 'channels', 'date', 'time']
        }
      },
      {
        name: 'tide_list_scheduled_posts',
        description: 'List all scheduled and queued posts across all channels.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'tide_list_approvals',
        description: 'List all drafts awaiting human review or approval.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'tide_approve_draft',
        description: 'Approve a pending draft post and move it to the scheduled publishing calendar.',
        inputSchema: {
          type: 'object',
          properties: {
            draft_id: {
              type: 'string',
              description: 'ID of the draft to approve (e.g. "appr-1")'
            }
          },
          required: ['draft_id']
        }
      },
      {
        name: 'tide_request_change',
        description: 'Request a revision or change on a draft post with specific instructions.',
        inputSchema: {
          type: 'object',
          properties: {
            draft_id: {
              type: 'string',
              description: 'ID of the draft to revise (e.g. "appr-1")'
            },
            feedback: {
              type: 'string',
              description: 'Detailed instructions on what should be revised or rewritten'
            }
          },
          required: ['draft_id', 'feedback']
        }
      },
      {
        name: 'tide_get_inbox',
        description: 'Retrieve unified comments, DMs, and community interactions across all connected social channels, with lead qualification flags.',
        inputSchema: {
          type: 'object',
          properties: {
            filter: {
              type: 'string',
              description: 'Optional filter: "All", "Instagram", "LinkedIn", "TikTok", or "unread"'
            }
          },
          required: []
        }
      },
      {
        name: 'tide_reply_to_message',
        description: 'Send an AI-assisted or custom reply to a comment or DM and mark the thread as resolved.',
        inputSchema: {
          type: 'object',
          properties: {
            thread_id: {
              type: 'string',
              description: 'ID of the conversation thread (e.g. "th-1")'
            },
            reply_text: {
              type: 'string',
              description: 'Content of the reply'
            }
          },
          required: ['thread_id', 'reply_text']
        }
      },
      {
        name: 'tide_get_analytics',
        description: 'Get cross-channel performance analytics (reach, engagement rate, top content, and attributed leads).',
        inputSchema: {
          type: 'object',
          properties: {
            period_days: {
              type: 'number',
              description: 'Time period in days (7 or 30)'
            }
          },
          required: []
        }
      },
      {
        name: 'tide_get_brand_brain',
        description: 'Retrieve the current Brand Brain rules, voice guidelines, guardrails, aesthetic parameters, and brand confidence score.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'tide_update_brand_brain',
        description: 'Update Tide\'s Brand Brain voice rules, guardrails, or visual aesthetic guidelines.',
        inputSchema: {
          type: 'object',
          properties: {
            section: {
              type: 'string',
              enum: ['voice', 'guardrails', 'visuals'],
              description: 'The brand section to update'
            },
            title: {
              type: 'string',
              description: 'Heading or summary of the rule'
            },
            details: {
              type: 'string',
              description: 'Detailed guidance and constraints'
            }
          },
          required: ['section', 'title', 'details']
        }
      }
    ]
  };
});

// Handle tool executions
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const state = loadState();

  try {
    switch (name) {
      case 'tide_list_accounts': {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  total_connected: state.accounts.length,
                  accounts: state.accounts
                },
                null,
                2
              )
            }
          ]
        };
      }

      case 'tide_connect_account': {
        const { platform, handle, workspace } = args;
        const validation = core.validateAccount(platform, handle);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        const normalized = validation.handle;
        const exists = state.accounts.some(
          (a) => a.platform.toLowerCase() === platform.toLowerCase() && a.handle.toLowerCase() === normalized.toLowerCase()
        );

        if (exists) {
          throw new Error(`Account ${normalized} on ${platform} is already connected.`);
        }

        const newAccount = {
          platform,
          handle: normalized,
          audience: '0 followers (New)',
          cls: platform.toLowerCase().slice(0, 2),
          status: 'Healthy',
          tokenExpires: '90 days',
          workspace: workspace || 'ACME Studio'
        };

        state.accounts.push(newAccount);
        saveState(state);

        return {
          content: [
            {
              type: 'text',
              text: `Successfully connected ${normalized} on ${platform}. Token verified healthy.`
            }
          ]
        };
      }

      case 'tide_disconnect_account': {
        const { handle } = args;
        const initialCount = state.accounts.length;
        state.accounts = state.accounts.filter(
          (a) => a.handle.toLowerCase() !== handle.toLowerCase()
        );

        if (state.accounts.length === initialCount) {
          throw new Error(`No connected account found with handle ${handle}.`);
        }

        saveState(state);
        return {
          content: [
            {
              type: 'text',
              text: `Disconnected ${handle}. Workspace channel list updated.`
            }
          ]
        };
      }

      case 'tide_generate_concepts': {
        const { prompt } = args;
        const concepts = core.generateConcepts(prompt);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ prompt, generated_concepts: concepts }, null, 2)
            }
          ]
        };
      }

      case 'tide_schedule_post': {
        const { copy, channels, date, time } = args;
        const res = core.createPost(copy, channels, date, time);
        if (!res.valid) {
          throw new Error(res.error);
        }

        const newPost = {
          ...res.post,
          title: res.post.copy.slice(0, 48),
          meta: channels.join(' · '),
          cls: channels[0].toLowerCase().slice(0, 2)
        };

        state.scheduled.unshift(newPost);
        saveState(state);

        return {
          content: [
            {
              type: 'text',
              text: `Post scheduled successfully for ${date} at ${time} across ${channels.join(', ')}.`
            }
          ]
        };
      }

      case 'tide_list_scheduled_posts': {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  total_scheduled: state.scheduled.length,
                  posts: state.scheduled
                },
                null,
                2
              )
            }
          ]
        };
      }

      case 'tide_list_approvals': {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  awaiting_review: state.approvals.length,
                  drafts: state.approvals
                },
                null,
                2
              )
            }
          ]
        };
      }

      case 'tide_approve_draft': {
        const { draft_id } = args;
        const draft = state.approvals.find((a) => a.id === draft_id);
        if (!draft) {
          throw new Error(`Draft ${draft_id} not found in approvals queue.`);
        }

        state.approvals = state.approvals.filter((a) => a.id !== draft_id);
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
        return {
          content: [
            {
              type: 'text',
              text: `Draft "${draft.title}" approved and scheduled into publishing calendar.`
            }
          ]
        };
      }

      case 'tide_request_change': {
        const { draft_id, feedback } = args;
        const draft = state.approvals.find((a) => a.id === draft_id);
        if (!draft) {
          throw new Error(`Draft ${draft_id} not found in approvals queue.`);
        }

        draft.revision = feedback;
        saveState(state);

        return {
          content: [
            {
              type: 'text',
              text: `Revision note attached to draft "${draft.title}": "${feedback}".`
            }
          ]
        };
      }

      case 'tide_get_inbox': {
        const { filter } = args;
        let threads = state.threads;
        if (filter === 'unread') {
          threads = threads.filter((t) => !t.handled);
        } else if (filter && filter !== 'All') {
          threads = threads.filter((t) => t.platform.toLowerCase() === filter.toLowerCase());
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  unread_count: state.threads.filter((t) => !t.handled).length,
                  total_threads: threads.length,
                  conversations: threads
                },
                null,
                2
              )
            }
          ]
        };
      }

      case 'tide_reply_to_message': {
        const { thread_id, reply_text } = args;
        const thread = state.threads.find((t) => t.id === thread_id);
        if (!thread) {
          throw new Error(`Conversation thread ${thread_id} not found.`);
        }

        thread.replies = thread.replies || [];
        thread.replies.push({ text: reply_text, time: 'Just now' });
        thread.handled = true;
        thread.reply = '';

        saveState(state);
        return {
          content: [
            {
              type: 'text',
              text: `Reply dispatched to ${thread.name} (${thread.platform}). Thread marked as handled.`
            }
          ]
        };
      }

      case 'tide_get_analytics': {
        const { period_days } = args;
        const data = { ...state.analytics };
        if (period_days === 7) {
          data.selected_period = 'Last 7 days';
          data.active_reach = data.reach7d;
        } else {
          data.selected_period = 'Last 30 days';
          data.active_reach = data.reach30d;
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2)
            }
          ]
        };
      }

      case 'tide_get_brand_brain': {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(state.brand, null, 2)
            }
          ]
        };
      }

      case 'tide_update_brand_brain': {
        const { section, title, details } = args;
        if (!state.brand[section]) {
          throw new Error(`Invalid section: ${section}. Must be 'voice', 'guardrails', or 'visuals'.`);
        }

        state.brand[section].title = title;
        state.brand[section].desc = details;
        saveState(state);

        return {
          content: [
            {
              type: 'text',
              text: `Brand Brain section "${section}" updated successfully.`
            }
          ]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `Error executing ${name}: ${error.message}`
        }
      ]
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Tide Social MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal MCP server error:', error);
  process.exit(1);
});
