---
title: "Getting Started with Claude Code: Setup Guide"
description: "A step-by-step guide to installing Claude Code, configuring your environment, choosing the right model, and running your first AI-assisted coding session."
date: "2026-02-07"
category: "claude-code"
image: "/images/blog/claude-code-setup.svg"
author: "Kenneth Abueg"
tags: ["claude-code", "setup", "installation", "getting-started"]
---

Getting Claude Code up and running takes less than five minutes, but taking the time to configure it properly from the start will save you hours later. This guide walks through installation, initial configuration, model selection, and your first productive session. By the end, you will have a fully working setup tailored to your development style.

## Installation and Requirements

Claude Code runs on macOS, Linux, and Windows via WSL. You need Node.js 18 or later installed on your system, though using the current LTS version is recommended for best compatibility. You also need an Anthropic API key or an active Claude subscription that supports the API.

Installation is straightforward with npm:

```bash
npm install -g @anthropic-ai/claude-code
```

After installation, verify it is working by running:

```bash
claude --version
```

You should see the current version number printed to your terminal. If you encounter permission errors on macOS or Linux, you may need to configure your npm global directory or use a version manager like nvm. The [official documentation](https://docs.anthropic.com/en/docs/claude-code) covers platform-specific setup details.

To authenticate, you will need to set your API key. Claude Code will prompt you for this on first run, or you can set it as an environment variable:

```bash
export ANTHROPIC_API_KEY=your-key-here
```

For persistent configuration, add this to your shell profile file (`.bashrc`, `.zshrc`, or equivalent).

## First Run and Basic Usage

Navigate to any project directory and launch Claude Code:

```bash
cd ~/projects/my-app
claude
```

Claude Code starts an interactive session within your terminal. You now have a conversation interface where you can describe tasks in natural language. Try something simple first:

```
> What files are in this project and what does each one do?
```

Claude Code will scan your project structure and give you an overview. This is a good way to verify it can see your files and understand the project. From here, you can issue more specific instructions:

```
> Add input validation to the user registration endpoint
```

Claude Code will find the relevant files, understand the existing code, and implement the changes. It will show you what it plans to do before writing files, and you can approve or ask for modifications.

For non-interactive use, you can pipe commands directly:

```bash
claude -p "Explain the authentication flow in this project"
```

The `-p` flag runs a single prompt and exits, which is useful for quick queries or scripting.

## Choosing the Right Model

Claude Code supports three models in the Claude 4.6 family, and choosing the right one for each task is an important optimization.

**Opus 4.6** is the most capable model. It excels at complex reasoning, architectural decisions, security audits, and tasks requiring deep analysis. Use Opus when mistakes would be costly or when you need the model to hold many constraints in mind simultaneously. It is slower and more expensive, but the quality difference on complex tasks is significant.

**Sonnet 4.6** is the balanced choice and the best default for most development work. Feature implementation, code reviews, refactoring, writing tests, API design, and bug fixes all work well with Sonnet. It is fast enough for interactive use and smart enough for most coding tasks.

**Haiku 4.6** is the speed-optimized model. Use it for quick fixes, running tests, file operations, git commits, and any task where speed matters more than deep reasoning. It costs significantly less than the other models, making it ideal for high-volume operations.

A practical rule of thumb: start with Sonnet for everyday work, upgrade to Opus for anything high-stakes or complex, and drop to Haiku for simple repetitive tasks.

## Configuring Your Environment

The real power of Claude Code emerges when you configure it for your specific workflow. The primary configuration mechanism is the `CLAUDE.md` file, which you can create at multiple levels.

A global `CLAUDE.md` in your home directory sets preferences that apply everywhere:

```markdown
# CLAUDE.md

## Preferences
- Use TypeScript strict mode in all projects
- Prefer functional programming patterns
- Write tests for all new functions
- Use conventional commit messages
```

A project-level `CLAUDE.md` in your repository root sets project-specific rules:

```markdown
# CLAUDE.md

## Project Context
- This is a Nuxt 4 application with Tailwind CSS 4
- State management uses useState (not Pinia)
- API routes are in server/api/

## Conventions
- Components use script setup with TypeScript
- All API responses follow the { data, error } pattern
- Tests use Vitest
```

Claude Code reads these files automatically and adjusts its behavior accordingly. This means every developer on your team can share the same conventions by committing the project `CLAUDE.md` to version control.

## Essential Configuration Tips

Beyond the basic `CLAUDE.md`, several configuration practices will improve your experience.

**Set up MCP servers** for your commonly used tools. If you work with databases, connect a database MCP server so Claude Code can query schemas directly. If you need current documentation, a documentation MCP server ensures Claude Code always has up-to-date reference material.

**Define your git workflow** in your configuration. If your team uses specific branch naming conventions, commit message formats, or PR templates, document these in your `CLAUDE.md`. Claude Code will follow them automatically.

**Establish security boundaries** early. Claude Code can run shell commands, which is powerful but requires awareness. Review the permission model and configure hooks to catch potentially dangerous operations before they execute. The tool will ask for confirmation before running commands, but having explicit rules about what is and is not acceptable provides an additional safety layer.

**Create project-specific commands** for common tasks. If you frequently run a specific sequence of operations, such as building, testing, and deploying, you can define these as patterns in your configuration that Claude Code recognizes and executes consistently.

## Your First Real Task

With setup complete, try a real development task. Navigate to a project you are actively working on and try one of these:

```
> Find all TODO comments in this project and create issues for each one
```

```
> Write unit tests for the user service module
```

```
> Review the last 5 commits for potential security issues
```

Watch how Claude Code navigates your codebase, reads relevant files, and produces results that account for your specific project structure. The first session might feel like magic. By the third session, it will feel like a natural part of your workflow.

The [Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code) covers advanced configuration options, troubleshooting, and examples for various project types. Take time to explore these as you get comfortable with the basics.
