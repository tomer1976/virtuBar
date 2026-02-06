# Copilot Instructions for virtuBar5

## Purpose
- Speed up routine coding and documentation while keeping human review and project standards intact.
- Keep outputs small, focused, and aligned with existing docs (architecture, security-privacy, db-schemas, QA test plan, UI-UX).

## How to Prompt Copilot
- Always include: what you want, where it lives (paths), and constraints (tech stack, security/privacy, performance).
- Cite relevant docs when asking (e.g., architecture, api-spec, UI-UX, security-privacy, devops, qa-test-plan).
- Ask for the smallest helpful change first (one file or function) before larger refactors.
- Prefer “explain and propose” over blind edits; request a short plan when work is non-trivial.
- Mention OS (Windows) and tools if relevant (PowerShell, VS Code tasks).

## Coding & Writing Conventions
- Default to ASCII; only use Unicode if already present and necessary.
- Keep comments sparse and meaningful; avoid restating the obvious.
- Match existing formatting and linting; keep functions small and focused.
- Ensure error handling and logging stay consistent with surrounding code.
- Favor clarity over cleverness; prefer explicit control flow.

## Privacy & Security
- Never paste secrets, tokens, or production data into prompts.
- Do not request or generate credentials or proprietary 3rd-party content.
- Follow security-privacy guidance in docs/security-privacy.md for data handling.

## File & Patch Hygiene
- Touch only the files you need; avoid broad rewrites.
- When editing, describe rationale and scope before applying changes.
- Keep diffs tight; avoid unrelated formatting churn.
- Add or update tests when behavior changes (see docs/qa-test-plan.md for expectations).

## Review Checklist for Copilot Suggestions
- Does the change match architecture and API contracts? (see docs/api-spec.md and docs/architecture.md)
- Are inputs validated and errors handled? Any logging/privacy pitfalls?
- Are tests present or updated? What manual/automated checks should run?
- Does the change alter performance or accessibility? Note any trade-offs.
- Are documentation and comments updated if behavior changes?

## Helpful Prompt Patterns
- “Summarize the intent of function X in path/to/file.”
- “Propose a minimal fix for bug Y; list risks and tests to run.”
- “Add a unit test for scenario Z using the existing testing style.”
- “Draft API docs for endpoint A based on api-spec.md; keep it concise.”

## When Not to Use Copilot
- Security-sensitive code without human review.
- Large refactors without a plan or tests.
- Generating legal, licensing, or policy text without owner approval.

## Output Expectations
- Short, direct answers; include file paths and next steps.
- If uncertain, state assumptions and ask clarifying questions.
- Prefer code blocks over prose when returning code; avoid noisy boilerplate.
