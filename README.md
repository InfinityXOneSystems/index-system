# InfinityXOneSystems / index

Tier-0 Global Index and Capabilities Registry.

This repo provides:
- repos.yml: canonical repository/service metadata
- actions.yml: capabilities and actions (source of truth)
- JSON Schemas for validation
- CLI: list/show repos, actions, capabilities, and generate OpenAPI for actions
- Minimal HTTP service exposing /healthz, /readyz, /repos, /actions, /capabilities, /actions/openapi

Developer notes:
- Use `npm run dev` for local development.
- Use `npm run cli` to run the CLI (or `ts-node src/cli/index.ts`).
- All configuration is YAML and validated at startup with AJV.
