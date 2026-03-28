---
title: "Claude in 2026: Everything Anthropic Has Shipped (So Far)"
description: "A comprehensive guide to every major Anthropic release in Q1 2026: Opus 4.6, Sonnet 4.6, Agent Teams, Auto Mode, Computer Use, MCP updates, and 60+ Claude Code releases."
date: "2026-03-28"
category: "claude-code"
image: "/images/blog/claude-2026-q1-releases.svg"
author: "Kenneth Abueg"
tags: ["claude-code", "ai", "anthropic", "opus", "sonnet", "agent-teams", "mcp", "automation"]
---

The first quarter of 2026 has been a dense period for Anthropic. Over 60 Claude Code releases, two major model launches, a multi-agent collaboration system, desktop computer control, and a sweeping expansion of the Model Context Protocol — all in 90 days.

This article covers every significant release from January through March 2026, with practical examples showing how to use each feature. Whether you are a developer using [Claude Code](/blog/claude-code-guide) daily or evaluating Claude for your organization, this is the complete picture.

## New Models: Opus 4.6 and Sonnet 4.6

The foundation of everything Anthropic shipped this quarter is two new model releases that significantly advanced AI capability, reasoning, and context handling.

### Claude Opus 4.6 — February 5, 2026

Per [Anthropic's announcement](https://www.anthropic.com/news/claude-opus-4-6), Opus 4.6 is their most capable model. The headline numbers: **68.8% on ARC-AGI-2** (an 83% jump over Opus 4.5's 37.6%), a **1 million token context window** that actually works (scoring 76% on 8-needle MRCR v2), and a METR task horizon of 14.5 hours — meaning it can autonomously work on tasks that take humans half a day.

**Key specs:**
- 1,000,000 token context window
- 128K max output tokens
- Default model on Max, Team, and Enterprise plans
- Fast mode available for lower-latency responses
- Available on Bedrock, Vertex AI, and Foundry

**How to use Opus 4.6:**

```bash
# Via Claude Code CLI
claude --model opus

# Via the API (Python)
import anthropic
client = anthropic.Anthropic()
message = client.messages.create(
    model="claude-opus-4-6-20250205",
    max_tokens=64000,
    messages=[{"role": "user", "content": "Analyze this codebase..."}]
)
```

### Claude Sonnet 4.6 — February 17, 2026

Sonnet 4.6 is the workhorse. Same 1M context window, preferred over Sonnet 4.5 roughly 70% of the time in blind evaluations, and — remarkably — competitive with Opus 4.5 (preferred 59% of the time) at a fraction of the cost.

This makes Sonnet 4.6 a strong default for most coding and production workloads — near-Opus-level reasoning with Sonnet-level latency and cost. [Official announcement](https://www.anthropic.com/news/claude-sonnet-4-6).

**Pricing comparison ([source](https://platform.claude.com/docs/en/about-claude/models/overview)):**

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Context | Max Output |
|-------|----------------------|------------------------|---------|------------|
| Opus 4.6 | $5 | $25 | 1M | 128K |
| Sonnet 4.6 | $3 | $15 | 1M | 64K |
| Haiku 4.5 | $1 | $5 | 200K | 64K |

> **When to use which:** Opus for security audits, complex architecture, and root-cause analysis. Sonnet for everything else: features, reviews, tests, refactoring, orchestration. Haiku for quick checks, test runs, and cost estimates.

## Agent Teams: Multi-Agent Collaboration

Launched alongside Opus 4.6 on February 5 ([docs](https://code.claude.com/docs/en/agent-teams)), **Agent Teams** is the biggest architectural addition of the quarter. Instead of a single Claude instance working sequentially, you can now spin up 2–16 agents that collaborate on shared task lists, send messages to each other, and work in parallel.

**How it works:**

- **Shared task lists:** Agents create, claim, and complete tasks visible to all team members
- **Direct messaging:** Agents communicate via `SendMessage` to coordinate
- **Git worktree isolation:** Each agent can work in its own isolated branch
- **Model mixing:** Use Opus for architecture, Sonnet for implementation, Haiku for testing

**Enable Agent Teams:**

```bash
# Set the environment variable
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1

# Then use Claude Code normally — it offers to spawn teams for complex tasks
claude "Refactor the auth module into microservices"

# Or explicitly request a team
claude "Use a team: one agent for the API, one for tests, one for docs"
```

> **New hook events for teams:** `TeammateIdle`, `TaskCreated`, and `TaskCompleted` let you react to team activity — build custom dashboards or trigger CI pipelines when agents finish their work.

### Subagents vs Agent Teams

Anthropic published [formal guidance](https://code.claude.com/docs/en/agent-teams) on March 24 clarifying the distinction:

- **Subagents:** Focused workers within a single session that report back to the parent. Use for parallelizing independent subtasks.
- **Agent Teams:** Peer agents with shared task lists and direct messaging. Use for complex, multi-day projects requiring coordination.

## Auto Mode: The Permission Sweet Spot

Released March 24, **Auto Mode** solves the biggest friction point in [Claude Code](/blog/claude-code-guide): the permission prompts. Previously, you had two extremes — confirm every action, or `--dangerously-skip-permissions`. Auto Mode is the middle ground.

**How it works:**

- An **AI safety classifier** evaluates each action before execution
- **Safe routine actions** (reading files, running tests, editing code) are auto-approved
- **Risky actions** (deleting files, force-pushing, running unknown scripts) still require confirmation
- **Prompt injection guard** prevents malicious instructions from tools or files from escalating

**Enable Auto Mode:**

```bash
# Start Claude Code in auto mode
claude --permission-mode auto

# Or enable auto mode first, then use it
claude --enable-auto-mode
```

Auto Mode uses Sonnet 4.6 or Opus 4.6 as the classifier model. It is designed to be conservative — it will sometimes ask for confirmation even when an action is safe, especially for unfamiliar patterns. Available to Team, Enterprise, and API users.

## Computer Use Agent: Claude on Your Mac

On March 23, Anthropic released the **Computer Use Agent** research preview ([docs](https://support.claude.com/en/articles/14128542-let-claude-use-your-computer-in-cowork)). Claude can now see your screen, click, type, scroll, and navigate your Mac desktop to complete tasks.

**Capabilities:**

- **Screen vision:** Claude sees your desktop via screenshots and understands UI elements, text, and layout
- **Click and type:** Direct mouse and keyboard control. Clicks buttons, fills forms, navigates menus
- **Connectors first:** Prioritizes API connectors (Slack, Figma, etc.) before falling back to screen control
- **Dispatch:** Assign tasks from iPhone, return to completed work on desktop. Persistent conversation threads across devices

**Example use cases:**

- **Cross-app workflows:** Pull designs from Figma, create Jira tickets, draft Slack messages to the team
- **Data entry:** Fill out form submissions from a spreadsheet
- **Testing:** Walk through the signup flow and screenshot each step
- **Research:** Find competitor pricing and compile a comparison table

> **Research preview only.** Currently macOS only, available to Pro and Max subscribers. The layered priority system (connectors → Chrome → screen control) minimizes raw pixel manipulation.

## Claude Cowork: AI Beyond Code

Initially launched January 12 for Max subscribers and [expanded to Pro on January 16](https://support.claude.com/en/articles/12138966-release-notes), **Claude Cowork** is "Claude Code for the rest of your work." While Claude Code targets developers, Cowork is a general-purpose desktop agent for non-technical users — reading, writing, and manipulating files directly.

By February 24, Anthropic expanded Cowork with enterprise connectors:

- **Google Workspace** — Calendar, Drive, Gmail integration
- **Slack** — Read channels, send messages, search history, summarize threads
- **Figma and Canva** — Pull designs, create assets, bridge design-to-dev workflows
- **DocuSign and Box** — Document management, contract review, signature workflows

When Cowork does not have a native connector for an app, it falls back to Computer Use for direct screen control. This makes it capable of working with any application, not just integrated ones.

## MCP: The Protocol That Connected Everything

The [Model Context Protocol](https://blog.modelcontextprotocol.io) has gone from a spec to an ecosystem. Donated to the Linux Foundation's Agentic AI Foundation in late 2025, MCP now has thousands of public servers and support from Claude, ChatGPT, Cursor, VS Code, Goose, and more.

### Key MCP milestones in Q1 2026

**MCP Apps — January 26:** Tools can now return interactive UI components — dashboards, forms, visualizations — that render directly in the conversation. This turns Claude from a text-only interface into a rich application platform.

**OAuth step-up authentication — February 19:** MCP servers can request elevated authentication mid-session. Combined with pre-configured OAuth clients for common services (Slack, etc.), connecting to authenticated APIs is much simpler.

**MCP Elicitation — March 14:** Servers can request structured input from users mid-task. Instead of failing silently when they need more information, servers present forms and questions.

**Channels — March 19 (research preview):** MCP servers can push messages into active sessions. Combined with the permission relay feature, you can even approve actions from your phone via a channel server.

**Connect an MCP server:**

```json
// .claude/settings.json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["@anthropic/mcp-server-github"]
    }
  }
}
```

## Hooks and Automation: Event-Driven Workflows

Hooks received the most cumulative attention in Q1 2026, with **15+ new hook events** added across releases ([hooks reference](https://code.claude.com/docs/en/hooks)). The hooks system now covers virtually every lifecycle event in Claude Code.

### New hook events in 2026

| Hook Event | When It Fires | Use Case |
|-----------|---------------|----------|
| `TeammateIdle` | Agent team member finishes | Reassign work, trigger reviews |
| `TaskCreated` | New task created | Notify external trackers |
| `TaskCompleted` | Task marked done | Trigger CI, update dashboards |
| `CwdChanged` | Working directory changes | Load project-specific env (direnv) |
| `FileChanged` | Watched file modified | Auto-reload, trigger builds |
| `WorktreeCreate` | Git worktree created | Initialize agent workspace |
| `PostCompact` | Conversation compressed | Log context window state |
| `Elicitation` | MCP server requests input | Custom input handling |
| `ConfigChange` | Settings modified | Validate config changes |
| `InstructionsLoaded` | CLAUDE.md files loaded | Audit loaded instructions |
| `StopFailure` | API error occurs | Error handling, alerting |

### HTTP Hooks — February 28

Hooks can now POST to URLs and receive JSON responses, enabling serverless event-driven workflows without local scripts:

```json
{
  "hooks": {
    "TaskCompleted": [{
      "type": "http",
      "url": "https://your-api.com/webhook/task-done",
      "method": "POST"
    }]
  }
}
```

### Conditional Hooks — March 26

Hooks can include an `if` field that filters by permission rule syntax. Run a hook only when specific tools or commands are used:

```json
{
  "hooks": {
    "PreToolUse": [{
      "if": "Bash(git *)",
      "command": "echo 'Git operation detected'"
    }]
  }
}
```

> **Power move:** `PreToolUse` hooks can return `additionalContext` that gets injected into Claude's context before the tool runs. Use this to provide dynamic instructions, inject environment data, or add project-specific rules based on what Claude is about to do.

## Auto-Memory: Claude Remembers

One of the most requested features, **auto-memory** was rolled out in stages:

- **February 5 (v2.1.32):** Initial launch. Claude automatically records and recalls important context — user preferences, project details, feedback — across conversations
- **February 26 (v2.1.59):** New `/memory` command to view, edit, and manage saved memories
- **March 12 (v2.1.74):** `autoMemoryDirectory` setting lets you control where memories are stored. Share memories across teams or keep them project-scoped
- **March 13 (v2.1.75):** Memories and project configs shared across git worktrees, so agent teams do not lose context

**Managing memory:**

```bash
# View all saved memories
/memory

# Tell Claude to remember something specific
"Remember that our staging environment uses port 8080"

# Tell Claude to forget something
"Forget the note about the old API endpoint"
```

## Scheduling: Cron Jobs and Loop

Two complementary features landed in early March for running Claude on a schedule:

**/loop Command (v2.1.71, March 7):** Run a prompt or slash command at recurring intervals. `/loop 5m /test` runs tests every 5 minutes. Defaults to 10-minute intervals.

**Cron Scheduling (v2.1.71):** Full cron scheduling with `CronCreate`, `CronList`, and `CronDelete` tools. Schedule Claude to run tasks at specific times.

```bash
# Loop: Run a health check every 5 minutes
/loop 5m "Check if https://api.example.com/health returns 200"

# Cron: Schedule a daily summary
"Schedule a daily 9am task to review overnight error logs and Slack me a summary"
```

## Git Worktrees: Isolated Agent Work

Git worktree support (v2.1.49, February 19) gives agents their own isolated copy of the repo. This is critical for agent teams — multiple agents can work on different branches simultaneously without stepping on each other.

```bash
# Start Claude Code in a worktree
claude --worktree
# Or short flag
claude -w

# Sparse checkout for monorepos
# In settings:
{
  "worktree": {
    "sparsePaths": ["packages/api/**", "shared/**"]
  }
}
```

> **Monorepo tip:** Use `worktree.sparsePaths` for large monorepos. Agents only check out the directories they need, reducing setup time and disk usage.

## Developer Experience Improvements

Beyond the headline features, dozens of quality-of-life improvements shipped across 60+ releases.

### Performance

- **~60ms faster macOS startup** (v2.1.75)
- **45% faster `--resume`** (v2.1.77) with 100–150MB less peak memory
- **74% fewer prompt re-renders** (v2.1.70) for smoother terminal experience
- **`--bare` flag** (v2.1.81) skips hooks, LSP, and plugins for 14% faster scripted calls

### New commands

- **/simplify** — Reviews changed code for reuse, quality, and efficiency
- **/batch** — Run operations across multiple files
- **/loop** — Recurring prompts at intervals
- **/effort** — Toggle thinking effort (low / medium / high)
- **/debug** — Session troubleshooting
- **/color** — Terminal color customization
- **/context** — Shows actionable suggestions for heavy tools and memory bloat

### Claude Code everywhere

Claude Code is now available as a **CLI terminal app**, **native desktop app** (Mac and Windows), **web app** at [claude.ai/code](https://claude.ai/code), and **IDE extensions** for VS Code and JetBrains.

### Other notable additions

- **PDF support** (v2.1.30): Read tool handles PDFs with page range selection
- **Windows ARM64 native binary** (v2.1.41) and **PowerShell tool preview** (v2.1.84)
- **20 voice languages** (v2.1.69), up from 10
- **Transcript search** (v2.1.83): Press `/` in transcript mode, navigate with `n`/`N`

## Enterprise, Healthcare, and the $30B Round

Q1 2026 was equally significant on the business side.

**January 11 — Claude for Healthcare:** HIPAA-ready enterprise tools with native CMS, ICD-10, PubMed, and FHIR integrations. Announced at the J.P. Morgan Healthcare Conference.

**January 13 — Anthropic Labs:** Instagram co-founder Mike Krieger joined to lead the Labs team alongside Ben Mann. Ami Vora appointed to lead Product.

**January 26 — Claude Interactive Apps:** Third-party integrations launched in claude.ai — Slack, Figma, Canva, Box, Clay, and others. Built on MCP.

**January 28 — ServiceNow Partnership:** ServiceNow chose Claude to power customer apps and productivity tools.

**February 12 — $30B Series G at $380B Valuation:** The largest private AI funding round to date. Revenue surpassed $2.5B annualized.

**February 24 — Responsible Scaling Policy v3.0:** A [comprehensive rewrite](https://www.anthropic.com/responsible-scaling-policy/rsp-v3-0) of Anthropic's safety framework. Adds Frontier Safety Roadmaps and published Risk Reports every 3–6 months.

**March 10 — Microsoft Copilot Cowork:** Microsoft launched Copilot Cowork powered by Claude inside Microsoft 365, tied to a new E7 licensing tier.

**March 12 — $100M Claude Partner Network:** Anthropic invested $100 million to build out the partner ecosystem.

**March 23 — Anthropic Science Blog:** New public blog documenting [AI-driven research](https://alignment.anthropic.com/). Launch post: a physicist supervising Claude through a theoretical physics calculation.

### Current pricing

| Plan | Price | Highlights |
|------|-------|------------|
| Free | $0 | Basic Claude access |
| Pro | $17/mo (annual) | Claude Code, research tools, Google Workspace |
| Max 5x | $100/mo | 5x Pro usage, persistent memory, early access |
| Max 20x | $200/mo | 20x Pro usage, priority access |
| Team | $25/seat/mo | Min 5 members, shared workspace |
| Enterprise | Custom | SSO, SCIM, audit logs, expanded context |

## What Is Next

### Code with Claude Developer Conference

Anthropic's first developer conference series: **San Francisco** (May 6), **London** (May 19), and **Tokyo** (June 10). Full-day workshops, live demos, and 1:1 office hours with Anthropic engineers. Livestream available globally. [Details](https://www.anthropic.com/news/Introducing-code-with-claude).

### Claude "Mythos" (unconfirmed)

On March 26, roughly 3,000 unpublished assets leaked from an unsecured CMS, revealing a model internally codenamed "Mythos" / "Capybara." Anthropic confirmed it is testing the model and described it as "a step change" in capabilities. No official specifications, pricing, or release date have been published.

> **Note:** Details about Mythos come from leaked documents, not official announcements. Treat all specifics as unconfirmed.

## Summary: Q1 2026 by the Numbers

- **60+** Claude Code releases (v2.0.76 through v2.1.86)
- **2** major model releases (Opus 4.6 and Sonnet 4.6)
- **1,000,000** token context window
- **15+** new hook events
- **20** voice languages
- **$30B** Series G funding round

The pattern across these releases is consistent: Claude is evolving from a conversational model into an agent platform — with teams, scheduling, memory, and desktop control layered on top of significantly improved foundation models.

**Official sources for staying updated:**

- [Claude Code GitHub Releases](https://github.com/anthropics/claude-code/releases)
- [Claude Code Changelog](https://code.claude.com/docs/en/changelog)
- [Anthropic News](https://www.anthropic.com/news)
- [Claude Models Overview](https://platform.claude.com/docs/en/about-claude/models/overview)
- [MCP Blog](https://blog.modelcontextprotocol.io)
