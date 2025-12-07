# SECURITY.md

Guidelines for the index service:

- No secrets in repository.
- Strict validation of YAML/JSON at startup (AJV).
- Minimal attack surface: read-only registry data.
- Changes to repos.yml or actions.yml should be made via PRs and validated by CI.
