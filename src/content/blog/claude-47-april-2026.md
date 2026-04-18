---
title: "Claude Opus 4.7 and the April 2026 Release Wave: What Actually Shipped"
description: "A full walkthrough of the April 2026 Claude releases — Opus 4.7 with 1M context, Claude Code Remote Control, the Agent SDK, Fast mode, Skills, plugins, and the MCP ecosystem. What's new, what to use, what to skip."
date: "2026-04-18"
category: "claude-code"
image: "/images/blog/claude-47-april-2026.svg"
author: "Kenneth Abueg"
tags: ["claude-code", "ai", "anthropic", "opus", "claude-4-7", "agent-sdk", "mcp", "remote-control", "release-notes"]
---

Anthropic's release cadence shifted up a gear this month. The headline is Claude Opus 4.7 with the 1M-token context window promoted out of beta, but the more interesting story is how much of Claude Code matured alongside it: the Agent SDK hardened, Remote Control arrived, Fast mode landed on Opus, plugins and skills became first-class, and the Model Context Protocol ecosystem grew to the point where it is doing real production work.

This is a full walkthrough of every April 2026 release that matters, written from the perspective of someone who uses these tools daily in client work. If you want the broader three-month picture, [the Q1 2026 releases post](/blog/claude-2026-q1-releases) covers everything Anthropic shipped from January through March. This article picks up where that one ends.

---

## Claude Opus 4.7 with 1M Context

The model ID is `claude-opus-4-7`. The variant with the extended context window is addressable as `claude-opus-4-7[1m]`, and it is the default for new Max-tier Claude Code sessions. If you are using the API, the 1M context is now a configuration flag rather than a private beta.

Three things changed in practice:

- **Larger workable context without degradation.** The 1M window has been available on Opus 4.6 for a while, but the practical upper limit where output quality held up was somewhere below the advertised number. Opus 4.7 closes that gap. I have loaded entire client codebases — frontend, backend, infra, and docs — into a single session and asked for cross-file reasoning without chunking. The answers are coherent at the far end of the window, not just the beginning.
- **Tool-use reliability improvements.** Tool-use failures on Opus 4.6 usually looked like the model picking the right tool but passing malformed arguments, or calling a tool when it should have answered from context. 4.7 is noticeably steadier on both. I have not had to re-prompt for tool-call repair anywhere near as often.
- **Better long-horizon task completion.** For autonomous agent runs — the kind where Claude works unattended for hours against a TODO list — 4.7 holds its thread longer. The mode switch from planning to execution to verification feels less brittle.

The cost story has not changed. Opus remains the most expensive of the three current models. The right frame is still: use Sonnet 4.6 for the bulk of coding and generation work, use Haiku 4.5 for classification and bulk throughput, reach for Opus when the task benefits from depth — long-context analysis, architectural decisions, multi-step agent runs.

```bash
# Claude Code CLI — Opus 4.7 with 1M context
claude --model opus

# Or explicit
claude --model claude-opus-4-7

# API (Python)
import anthropic
client = anthropic.Anthropic()
msg = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=64000,
    messages=[{"role": "user", "content": "..."}],
)
```

If you want the larger context window explicitly on the API, the pattern is usually a `context_window` or `beta` header — check the [Anthropic models overview](https://platform.claude.com/docs/en/about-claude/models/overview) for the exact flag because the naming has shifted a couple of times across betas and I would rather point you at the current source than quote a header that changed last Tuesday.

---

## Claude Code: Remote Control

This is the Claude Code release I have found most useful in day-to-day work. Remote Control lets you attach to a running Claude Code session from a phone, tablet, or any web browser. The command is `claude remote-control` at the CLI, or `/rc` from inside an existing session.

Practical use cases:

- **Babysit a long agent run from the sofa.** Start a refactor or test-suite generation in the morning, then check progress from your phone while making lunch.
- **Trigger actions from a device you are already holding.** If Claude is waiting for a permission prompt, you can approve it from your phone rather than walking back to the machine.
- **Hand off to another machine without killing the session.** I have started a session on my laptop, connected to it from a browser on a different computer, and continued without losing any state.

Remote Control is available for Max users on Claude Code v2.1.52 and later. Run `claude --version` to check. The connection is end-to-end authenticated — Anthropic surfaces a short-lived code you enter on the remote device to pair it with the running session.

The feature pairs well with background tasks. Kick off a long-running build or test suite with `run_in_background`, leave the session running, and monitor or intervene from wherever you are. I have replaced a lot of VNC and SSH workflow with this.

---

## Fast Mode on Opus 4.6

Fast mode, toggled inside a session with `/fast`, routes Opus 4.6 requests through a lower-latency serving path. Importantly, it does not downgrade to a smaller model. You get Opus 4.6 quality at closer to Sonnet speeds, which changes the cost/speed decision for interactive sessions.

Fast mode is currently Opus 4.6 only, not 4.7. That is worth noting — if you prefer absolute latest-model capability, you stay on 4.7 at standard speed; if you want the Opus quality floor at interactive speed and can live one minor version behind, Fast mode 4.6 is the fastest "real model" experience available right now.

My default in the CLI is Opus 4.7 for work that benefits from the extra headroom, Fast-mode Opus 4.6 for conversational iteration, and Sonnet 4.6 for high-volume generation where I am going to run a hundred prompts in a loop.

---

## The Agent SDK

If you have been building agents by wrapping the raw Messages API, the Agent SDK is the cleanup you were probably about to write yourself. It is a higher-level Python and TypeScript library that wraps:

- Tool definition and dispatch
- Multi-step agent loops with memory
- Compaction of long conversation histories
- Human-in-the-loop approvals
- Subagent spawning for parallel work

The SDK has been around in pre-release form, but the April releases moved it to the "stable enough to use in production" tier. The documentation now has a full surface — model selection, tool registration, managed memory, and the patterns Anthropic themselves use internally for Claude Code itself.

The mental model is the one Claude Code already uses: a main agent that delegates to subagents, each with a focused tool set, and a compaction step that prevents context from ballooning across long runs. Previously you had to rebuild all of that yourself. Now the SDK does the boilerplate and leaves you with the business logic.

A minimal agent looks roughly like this:

```python
from anthropic import Agent, tool

@tool
def search_crm(query: str) -> list[dict]:
    """Search CRM records by free-text query."""
    ...

@tool
def send_email(to: str, subject: str, body: str) -> dict:
    """Send an email through the company's ESP."""
    ...

agent = Agent(
    model="claude-sonnet-4-6",
    tools=[search_crm, send_email],
    system="You are a revenue ops assistant. Ask before sending email.",
)

result = agent.run(
    "Find everyone in CRM with 'renewal' in their notes "
    "and draft a check-in email. Do not send yet — show me the drafts."
)
```

The SDK handles the tool loop, the JSON schema for each tool from the function signature, the message history, and the pause-for-approval pattern. You write the Python your tools need and let the SDK orchestrate the conversation.

For agents that run unattended — daily CRM hygiene, content publishing pipelines, competitive monitoring — this is the right abstraction layer. Writing it by hand was possible; writing it by hand also meant you were going to re-debug the same edge cases that the SDK now handles for you.

---

## Skills, Plugins, and the MCP Ecosystem

Claude Code's customization surface has three layers now, and the April releases made the edges between them clearer.

**Skills** are user-invocable capabilities tied to the session. Think of a skill as a packaged combination of system-prompt context, preferred tools, and a naming convention. When I type `/loop` or `/security-review` in Claude Code, a skill is activated — the model is briefed on the specific task shape and gets access to tools scoped to that skill.

**Plugins** bundle skills and custom commands for distribution. A plugin can ship multiple skills, hook handlers, and MCP server configurations in one installable unit. The `context7` plugin I have installed, for example, pulls documentation for libraries on demand so the model can answer questions against current docs instead of training data.

**MCP servers** are the lowest-level extension point. They expose tools and resources over a standard protocol, and any MCP-compatible client — Claude Code, Claude Desktop, custom apps built on the Agent SDK — can talk to them. The MCP ecosystem grew rapidly this month; there are now first-party integrations for Google Drive, Supabase, Notion, GitHub, Slack, and a long tail of community servers.

Useful mental model:

- **A skill is for the model.** It shapes how Claude behaves when invoked.
- **A plugin is for distribution.** It packages skills, commands, and MCPs as one installable.
- **An MCP server is for tools and data.** It is the connector between Claude and the outside world.

For most teams, the right order of adoption is: start with MCP servers for the external systems you already use, then add or write skills for the tasks you repeat often, then package those as a plugin if you want to share them across a team.

---

## Developer-Facing Changes

A handful of lower-profile changes that I have been actively using:

**Hooks.** Claude Code's hook system lets you run shell commands in response to session events — before a tool call, after a file edit, on session start, and so on. The `update-config` skill will write hooks into `~/.claude/settings.json` for you when you describe the behavior in natural language. Common uses: auto-format on file save, block commits without running the linter, play a sound when a long task finishes.

**Slash commands.** Custom slash commands live in `~/.claude/commands/*.md` and behave like mini-skills tied to a single file. The skill files I wrote for `/codex` (second-opinion coding assistance) and `/push` (commit and push with smart messages) live here. Any text file in that directory with a YAML frontmatter `description` becomes a slash command available in every session.

**ToolSearch.** The Claude Code harness now supports deferred tool loading. Rather than listing hundreds of available tools in the initial system prompt, only the core ones are loaded; additional tools are fetched on demand through a ToolSearch interface. This keeps the base system prompt fast while letting long sessions reach for specialised tools without paying the context cost up front.

**Background tasks and Monitor.** Long-running commands now run as tracked background tasks. When one completes, the session receives a notification rather than blocking on the output. The Monitor tool streams events from a script as they happen — useful for watching a build log or polling an API for a state change without burning context on irrelevant lines.

**Scheduled agents (Cron).** You can now schedule agent runs on a cron expression using `CronCreate`. I use this for a daily 6am run that scans the project's open PRs and drafts review summaries. The agent itself is a short prompt; the scheduler makes it a cron job without me touching any infrastructure.

None of these are flashy on their own. In combination, they move Claude Code from "AI assistant in your terminal" towards "persistent programmable environment that happens to have an LLM at the centre."

---

## What This Means If You Are a Marketer

Most marketing operators I talk to are still using Claude through the chat interface. That is fine for drafting individual emails or ad copy. It is the wrong place to work if you want to run volume.

The April releases make three specific things easier for marketing automation:

- **Batch and scheduled jobs.** A scheduled agent that regenerates your content brief backlog every Monday morning, or scores every new lead in your CRM every 15 minutes, is now a few lines of configuration rather than a pipeline project.
- **Structured tool use.** Plugging Claude into your ESP, your ad platforms, and your CRM through MCP servers means Claude can read and write the systems of record directly rather than handing you copy to paste into a form.
- **Bigger context for personalisation.** The 1M window on Opus 4.7 is enough to load a full persona library, your product catalogue, and a segment-specific brand voice brief into one call. Output quality on "generate 200 product description variants for different personas" is materially better when the reference material is all in-session than when you chunk it across calls.

For the implementation playbook — use cases, code, cost math — [the Claude marketing automation post](/blog/claude-marketing-automation) is the companion piece to this one. It uses the models and APIs described here and walks through six concrete marketing use cases end-to-end.

---

## What This Means If You Are Building Products

The Agent SDK is the single biggest lever for product builders this month. If you were thinking about adding an AI agent to your product — a support copilot, a data-analysis assistant, a pipeline runner — the SDK removes most of the undifferentiated glue work.

A rough decision tree:

- **If your agent is narrow and lives in-product**, use the Agent SDK with your tools and call it from your backend. The SDK handles the loop, you handle the auth and the UI.
- **If your agent needs to interact with external systems your users have configured**, use MCP servers so each user plugs in their own Google Drive, Notion, Supabase, whatever. You do not have to build N integration surfaces.
- **If your agent needs to be remote-controllable or long-running**, use Claude Code with a custom skill + plugin distribution rather than rolling your own agent UI. Remote Control and the hooks system give you most of what you would otherwise build.

The practical result: for a lot of agent-shaped products, the right engineering effort is now in the domain logic (what tools, what prompts, what guardrails) rather than the plumbing (how do I run an agent loop reliably).

---

## What to Skip

Not every April release is worth your attention. A few honest calls:

- **Every feature still labelled "beta" on the Anthropic status page.** The model capabilities are production-grade; several beta features around streaming, structured outputs, and batch management are still actively shifting. If you adopt them now, expect one or two breaking changes before the next stable release.
- **Marketing-flavoured AI tools that wrap Claude and charge a premium.** The pattern where a third-party SaaS adds a thin UI on top of `claude.messages.create()` and charges $200 per seat is real and noticeable. The Agent SDK and MCP mean you can build the same thing internally for your specific workflow in a day. Evaluate whether what you are paying for is the wrapper or the underlying capability.
- **Chasing every model release the day it drops.** For production workloads, your evaluation cycle should outlast any single model version. Pick a tier (Sonnet for default, Opus for depth, Haiku for throughput), build your evaluations, and only promote to a new model after it beats the incumbent on your evals.

---

## Resources

Official Anthropic surfaces worth bookmarking if you are doing this seriously:

- **Models overview**: [platform.claude.com/docs/en/about-claude/models/overview](https://platform.claude.com/docs/en/about-claude/models/overview) — current model IDs, context windows, pricing. Check here for the exact `context_window` header names if you are using the 1M variant via API.
- **Agent SDK docs**: [platform.claude.com/docs/en/agent-sdk](https://platform.claude.com/docs/en/agent-sdk) — installation, tool registration, memory, subagents, compaction.
- **Claude Code docs**: [docs.claude.com/en/docs/claude-code](https://docs.claude.com/en/docs/claude-code) — hooks, skills, plugins, Remote Control, slash commands, settings.
- **MCP spec and servers**: [modelcontextprotocol.io](https://modelcontextprotocol.io) — protocol reference and a directory of available servers.
- **Anthropic news**: [anthropic.com/news](https://anthropic.com/news) — official release announcements, including the versioned model announcements referenced above.

The underlying tools have moved faster than the ecosystem of guides has. Expect the next month or two to be a catch-up period where patterns, best practices, and opinionated starter templates emerge around the Agent SDK and the expanded Claude Code surface.

For the broader Q1 context — Opus 4.6, Sonnet 4.6, Computer Use, Agent Teams — see [the Q1 2026 releases post](/blog/claude-2026-q1-releases). For building marketing automation specifically on top of all this, [Claude for marketing automation](/blog/claude-marketing-automation) is the implementation companion to this piece.

The short version of April: Opus 4.7 is the first model version where the 1M context window genuinely behaves like a 1M context window. Claude Code went from a good CLI to a programmable environment. The Agent SDK removed the reason most people were rebuilding the same agent loop from scratch. Most of the friction of a month ago is gone. The interesting questions are now about what you build with it, not whether the tools are ready.
