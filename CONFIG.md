# index/CONFIG.md

Configuration and environment notes for the index service.

This service reads:
- repos.yml
- actions.yml
- schemas/*

No runtime secrets required for the index registry, but the gateway and workspace repos will need:
- INF_TWILIO_ACCOUNT_SID
- INF_TWILIO_AUTH_TOKEN
- INF_OPENAI_API_KEY
- INF_GWORKSPACE_SERVICE_ACCOUNT_JSON

Do not commit secrets into the repository. Use your organization secret manager or GitHub Actions secrets.
