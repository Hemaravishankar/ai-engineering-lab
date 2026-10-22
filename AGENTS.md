@'
# Project Instructions

## Before making changes
- Inspect the existing code and package.json.
- Explain the implementation plan before editing.
- Follow existing project patterns.
- Change only files necessary for the requested task.

## Coding standards
- Use Node.js and CommonJS, consistent with this project.
- Keep route handlers simple and maintain clear separation of concerns.
- Validate all untrusted request input.
- Avoid unnecessary dependencies and unrelated refactoring.

## Testing
- Add or update tests for changed behavior.
- Cover successful cases, invalid input, and relevant edge cases.
- Run npm test after implementation.
- Report actual test results; never claim tests passed without running them.

## Safety
- Do not hardcode secrets or credentials.
- Do not run destructive commands without explicit approval.
- Ask before changing files outside this project.

## Completion report
- Summarize changed files and key decisions.
- Report commands executed and actual test results.
- Identify remaining limitations.
'@ | Set-Content -Encoding utf8 AGENTS.md
