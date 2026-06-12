# AGENTS.md

## Repository Summary

This repository is an incremental TypeScript/Express ERP backend composed of small service folders and a shared package. The current platform includes an API gateway, auth service, structured logging, correlation IDs, health checks, rate limiting, graceful shutdown, shared response/error/validation/logging/pagination/enums/auth utilities, and the Student, Academic Structure, Profile, and Attendance domain services.

## Architecture Notes

- Keep services small and focused; do not create large service implementations unless explicitly requested.
- Prefer incremental architecture improvements over broad feature expansion.
- Reuse `@erp/shared` for shared response helpers, error codes, validation middleware, logging, pagination, enums, and shared types.
- Preserve existing business logic unless a task explicitly asks for behavior changes.
- Use npm workspaces for shared packages; `packages/shared` is published internally as `@erp/shared`.

## Codex Usage Guidelines

- Read only the files needed for the current task; avoid broad repository scans.
- Avoid touching many files at once unless required by the task.
- Keep diffs small, focused, and easy to review.
- Do not generate complete CRUD services, frontend code, or hundreds of lines of code unless specifically requested.
- After code changes, update this file if repository architecture, package structure, or shared patterns change.

## Current Priorities

1. Minimize token usage.
2. Avoid unnecessary file modifications.
3. Reuse shared package patterns.
4. Improve architecture incrementally.
5. Build the smallest useful next step.

## Explicit Non-Goals Unless Requested

- Do not start Timetable Service.
- Do not start Exam Service.
- Do not start Billing Service.
- Do not build complete Subject Management.
- Do not create frontend code.
