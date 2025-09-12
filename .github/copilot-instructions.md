# GitHub Copilot instructions

Purpose
- Help authors write code that fits this repository's conventions.
- Prefer clear, minimal, well-tested changes.

General guidelines
- Use English.
- Follow existing project patterns and file structure.
- Keep changes small and focused; prefer separate suggestions per concern.
- Do not introduce new runtime dependencies without justification.
- Do not add secrets, credentials, or environment values.
- Preserve existing formatting and lint rules; prefer TypeScript/strict types if present.
- Add or update tests for new functionality; keep tests deterministic and fast.
- Include concise docstrings/comments for non-obvious code.
- In chat, keep summaries short and concise.

Code style
- Favor readability and explicitness over cleverness.
- Use descriptive names for functions, variables, and types.
- Return early to reduce nesting.
- Handle errors explicitly; prefer typed errors or Result-style returns if used in repo.
- Avoid large inline data blobs; load from fixtures or sample files.

Commit messages
- Use one-line prefix formats: feat:, fix:, docs:, test:, refactor:, chore:
- Start with prefix then short description, e.g. "feat: add user email validation".
- Keep body brief and explain rationale when necessary.

Assistant behavior
- When asked to generate code, include runnable examples and minimal tests.
- When unsure about repository conventions, ask a clarifying question.
- Do not modify CI or release workflows without explicit instruction.

If uncertain
- Ask for the preferred language, style guide, or an example file to match.