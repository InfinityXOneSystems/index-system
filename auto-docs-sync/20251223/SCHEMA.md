# Schema Documentation

This document provides comprehensive documentation for all schemas used in the Global Index.

## Table of Contents

1. [Repository Schema](#repository-schema)
2. [Capability Schema](#capability-schema)
3. [Action Schema](#action-schema)
4. [Extending Schemas](#extending-schemas)
5. [Schema Evolution](#schema-evolution)

---

## Repository Schema

**Location:** `schemas/repos/repo.schema.json`

Defines the structure for all repository entries in `config/repos.yml`.

### Schema Fields

#### `id` (required)

- **Type:** string
- **Pattern:** `^inf-s[0-9]+-[a-z0-9-]+$`
- **Example:** `inf-s0-index`, `inf-s1-gateway`
- **Description:** Unique identifier for the repository
- **Format:** `inf-s{stage}-{name}` where stage is 0-10

#### `name` (required)

- **Type:** string
- **Example:** `index`, `gateway`, `workspace`
- **Description:** Short, memorable name for the repository
- **Usage:** Used in URLs, routing, and references

#### `repo` (required)

- **Type:** string
- **Example:** `InfinityXOneSystems/index`
- **Description:** GitHub repository in `owner/repo` format
- **Note:** Must match actual GitHub repository

#### `stage` (required)

- **Type:** integer
- **Range:** 0-10
- **Description:** Development stage (0 = foundation, 10 = mature)
- **Guidelines:**
  - **0-2:** Core infrastructure, foundational services
  - **3-5:** Core business logic, primary features
  - **6-8:** Advanced features, integrations
  - **9-10:** Experimental, future-looking features

#### `domain` (required)

- **Type:** string
- **Enum:** `infrastructure`, `application`, `integration`, `tooling`, `docs`
- **Description:** High-level domain category
- **Examples:**
  - `infrastructure`: index, gateway, auth
  - `application`: workspace, agents, social
  - `integration`: google-workspace, twitter
  - `tooling`: cli-tools, development-scripts
  - `docs`: documentation, architecture-diagrams

#### `tier` (required)

- **Type:** string
- **Enum:** `tier_0`, `tier_1`, `tier_2`
- **Description:** Architecture tier
- **Definitions:**
  - **tier_0:** Foundational services (index, gateway, auth)
  - **tier_1:** Core business services (workspace, agents, social)
  - **tier_2:** Feature services and integrations

#### `status` (required)

- **Type:** string
- **Enum:** `active`, `maintenance`, `deprecated`, `archived`
- **Description:** Repository lifecycle status
- **Guidelines:**
  - `active`: Actively developed and maintained
  - `maintenance`: Stable, only critical fixes
  - `deprecated`: Being phased out, use alternatives
  - `archived`: No longer maintained

#### `runtime` (required)

- **Type:** boolean
- **Description:** Whether the service runs as a server/daemon
- **Examples:**
  - `true`: HTTP APIs, workers, daemons
  - `false`: Libraries, scripts, configurations

#### `description` (required)

- **Type:** string
- **Min Length:** 10 characters
- **Description:** Clear, concise description of the repository's purpose
- **Guidelines:** Start with a verb (e.g., "Provides", "Manages", "Handles")

#### `tags` (optional)

- **Type:** array of strings
- **Example:** `["registry", "discovery", "tier-0"]`
- **Description:** Searchable tags for classification and discovery
- **Guidelines:** Use lowercase, hyphen-separated tags

#### `entrypoints` (optional)

- **Type:** object
- **Description:** How to access/invoke this service

**Subfields:**

- `api` (array): HTTP API endpoints
  ```yaml
  api:
    - "http://index:3000"
    - "https://index.fullauto.systems"
  ```
- `workers` (array): Background workers/processors
  ```yaml
  workers:
    - "email-queue-processor"
    - "analytics-aggregator"
  ```
- `cli` (array): Command-line interfaces
  ```yaml
  cli:
    - "index repos:list"
    - "index actions:list"
  ```
- `grpc` (array): gRPC services
  ```yaml
  grpc:
    - "index.RegistryService"
  ```

#### `datastores` (optional)

- **Type:** object
- **Description:** Databases and storage systems used

**Subfields:**

- `primary` (array): Primary databases
  ```yaml
  primary:
    - type: "postgresql"
      name: "workspace_db"
  ```
- `caches` (array): Cache systems
  ```yaml
  caches:
    - type: "redis"
      name: "session_cache"
  ```
- `queues` (array): Message queues
  ```yaml
  queues:
    - type: "rabbitmq"
      name: "email_queue"
  ```
- `storage` (array): Object/file storage
  ```yaml
  storage:
    - type: "s3"
      name: "attachments"
  ```

#### `dependencies` (optional)

- **Type:** object
- **Description:** Dependencies on other services

**Subfields:**

- `internal` (array): Internal Infinity XOS services
  ```yaml
  internal:
    - "gateway"
    - "auth"
  ```
- `external` (array): External third-party services
  ```yaml
  external:
    - "openai-api"
    - "google-workspace"
  ```

### Example Repository Entry

```yaml
repositories:
  - id: "inf-s1-workspace"
    name: "workspace"
    repo: "InfinityXOneSystems/workspace"
    stage: 1
    domain: "application"
    tier: "tier_1"
    status: "active"
    runtime: true
    description: "Google Workspace integration for Gmail, Calendar, Tasks, Drive"
    tags: ["google-workspace", "email", "calendar", "productivity"]
    entrypoints:
      api:
        - "http://workspace:8080"
        - "https://workspace.fullauto.systems"
      workers:
        - "email-sync-worker"
        - "calendar-sync-worker"
    datastores:
      primary:
        - type: "postgresql"
          name: "workspace_db"
      caches:
        - type: "redis"
          name: "token_cache"
    dependencies:
      internal:
        - "gateway"
        - "auth"
      external:
        - "google-workspace-api"
```

---

## Capability Schema

**Location:** `schemas/capabilities/capability.schema.json`

Defines high-level capabilities available in the platform.

### Schema Fields

#### `id` (required)

- **Type:** string
- **Pattern:** `^cap\.[a-z]+\.[a-z_]+\.[a-z_]+$`
- **Format:** `cap.{domain}.{resource}.{verb}`
- **Example:** `cap.workspace.email.send`
- **Description:** Unique capability identifier
- **Guidelines:**
  - Use lowercase
  - Use underscores for multi-word components
  - Follow RESTful naming: resource before verb

#### `name` (required)

- **Type:** string
- **Example:** `Send Email`, `Generate Image`
- **Description:** Human-readable capability name
- **Guidelines:** Use title case, start with verb

#### `description` (required)

- **Type:** string
- **Min Length:** 20 characters
- **Description:** Detailed description of what this capability does
- **Guidelines:**
  - Explain use cases
  - Mention key features
  - Include limitations if any

#### `domain` (required)

- **Type:** string
- **Enum:** `workspace`, `social`, `agents`, `ml`, `analytics`, `infrastructure`
- **Description:** Domain category
- **Definitions:**
  - `workspace`: Google Workspace operations (email, calendar, tasks, drive)
  - `social`: Social media operations (posting, analytics)
  - `agents`: AI agent capabilities (reasoning, planning, execution)
  - `ml`: Machine learning operations (image gen, text analysis, embeddings)
  - `analytics`: Data analysis and reporting
  - `infrastructure`: System-level capabilities

#### `tags` (optional)

- **Type:** array of strings
- **Example:** `["gmail", "email", "outbound"]`
- **Description:** Searchable tags
- **Guidelines:** Use specific, descriptive tags

#### `rate_limit` (optional)

- **Type:** object
- **Description:** Rate limiting configuration

**Subfields:**

- `requests_per_minute` (integer): Requests allowed per minute
- `requests_per_hour` (integer): Requests allowed per hour
- `requests_per_day` (integer): Requests allowed per day

Example:

```yaml
rate_limit:
  requests_per_minute: 60
  requests_per_hour: 1000
  requests_per_day: 10000
```

#### `required_permissions` (optional)

- **Type:** array of strings
- **Example:** `["gmail.send", "gmail.compose"]`
- **Description:** OAuth2 scopes or permissions required
- **Guidelines:** Use official API scope names

### Example Capability Entry

```yaml
capabilities:
  - id: "cap.workspace.email.send"
    name: "Send Email"
    description: "Send transactional or assistant-composed emails via Gmail API. Supports HTML and plain text, attachments, CC/BCC recipients, and custom headers."
    domain: "workspace"
    tags: ["gmail", "email", "outbound", "notifications"]
    rate_limit:
      requests_per_minute: 60
      requests_per_hour: 1000
    required_permissions:
      - "https://www.googleapis.com/auth/gmail.send"
      - "https://www.googleapis.com/auth/gmail.compose"
```

---

## Action Schema

**Location:** `schemas/actions/action.schema.json`

Defines concrete API endpoints that implement capabilities.

### Schema Fields

#### `id` (required)

- **Type:** string
- **Pattern:** `^act\.[a-z]+\.[a-z_]+$`
- **Format:** `act.{domain}.{verb}_{resource}`
- **Example:** `act.workspace.send_email`
- **Description:** Unique action identifier
- **Guidelines:**
  - Use lowercase
  - Use underscores for separation
  - Verb should come before resource

#### `capability_id` (required)

- **Type:** string
- **Pattern:** `^cap\..*`
- **Description:** Reference to parent capability
- **Validation:** Must reference existing capability ID
- **Example:** `cap.workspace.email.send`

#### `repo` (required)

- **Type:** string
- **Description:** Repository name that implements this action
- **Example:** `workspace`
- **Validation:** Must reference existing repository name

#### `service` (required)

- **Type:** string
- **Description:** Specific service/process within the repo
- **Example:** `workspace-api`, `ml-worker`
- **Guidelines:** Use lowercase, hyphen-separated

#### `http` (required)

- **Type:** object
- **Description:** HTTP endpoint details

**Subfields:**

- `method` (required): HTTP method
  - **Enum:** `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- `path` (required): URL path
  - **Pattern:** Must start with `/`
  - **Example:** `/aura/workspace/send-email`
  - **Guidelines:** Use kebab-case, include version if applicable

Example:

```yaml
http:
  method: "POST"
  path: "/aura/workspace/send-email"
```

#### `auth` (required)

- **Type:** string
- **Enum:** `internal_api_key`, `oauth2`, `jwt`, `public`
- **Description:** Authentication method
- **Definitions:**
  - `internal_api_key`: Service-to-service (X-API-Key header)
  - `oauth2`: User-delegated access (Authorization: Bearer)
  - `jwt`: JWT token (Authorization: Bearer)
  - `public`: No authentication required

#### `input_schema_ref` (optional)

- **Type:** string
- **Description:** Path to JSON Schema file for request body
- **Example:** `schemas/actions/workspace.send_email.request.json`
- **Guidelines:** Must be valid JSON Schema Draft 2020-12

#### `output_schema_ref` (optional)

- **Type:** string
- **Description:** Path to JSON Schema file for response body
- **Example:** `schemas/actions/workspace.send_email.response.json`
- **Guidelines:** Must be valid JSON Schema Draft 2020-12

#### `examples` (optional)

- **Type:** array of objects
- **Description:** Request/response examples

**Example Structure:**

```yaml
examples:
  - name: "Send simple email"
    request:
      to: "user@example.com"
      subject: "Hello"
      body: "Test message"
    response:
      message_id: "abc123"
      status: "sent"
```

### Example Action Entry

```yaml
actions:
  - id: "act.workspace.send_email"
    capability_id: "cap.workspace.email.send"
    repo: "workspace"
    service: "workspace-api"
    http:
      method: "POST"
      path: "/aura/workspace/send-email"
    auth: "internal_api_key"
    input_schema_ref: "schemas/actions/workspace.send_email.request.json"
    output_schema_ref: "schemas/actions/workspace.send_email.response.json"
    examples:
      - name: "Send notification email"
        request:
          to: "admin@fullauto.systems"
          subject: "System Alert"
          body: "CPU usage exceeded 90%"
        response:
          message_id: "msg_abc123"
          status: "sent"
          timestamp: "2025-01-15T10:30:00Z"
```

### Action Request/Response Schemas

Action schemas are stored in `schemas/actions/` and follow JSON Schema Draft 2020-12.

**Example Request Schema (`workspace.send_email.request.json`):**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["to", "subject", "body"],
  "properties": {
    "to": {
      "type": "string",
      "format": "email",
      "description": "Recipient email address"
    },
    "cc": {
      "type": "array",
      "items": { "type": "string", "format": "email" },
      "description": "CC recipients"
    },
    "bcc": {
      "type": "array",
      "items": { "type": "string", "format": "email" },
      "description": "BCC recipients"
    },
    "subject": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200,
      "description": "Email subject line"
    },
    "body": {
      "type": "string",
      "minLength": 1,
      "description": "Email body (plain text or HTML)"
    },
    "html": {
      "type": "boolean",
      "default": false,
      "description": "Whether body is HTML"
    }
  }
}
```

**Example Response Schema (`workspace.send_email.response.json`):**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["message_id", "status"],
  "properties": {
    "message_id": {
      "type": "string",
      "description": "Unique message identifier"
    },
    "status": {
      "type": "string",
      "enum": ["sent", "queued", "failed"],
      "description": "Delivery status"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "When the email was sent"
    },
    "error": {
      "type": "string",
      "description": "Error message if status is failed"
    }
  }
}
```

---

## Extending Schemas

### Adding Custom Fields

You can extend schemas to add custom fields for your specific needs.

#### Step 1: Update JSON Schema

Edit the appropriate schema file in `schemas/`:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    // ... existing fields ...
    "custom_field": {
      "type": "string",
      "description": "My custom field"
    }
  }
}
```

#### Step 2: Update TypeScript Types

Edit `src/types/index.ts`:

```typescript
export interface Repo {
  // ... existing fields ...
  custom_field?: string;
}
```

#### Step 3: Update Configuration

Add the field to your `config/*.yml` files:

```yaml
repositories:
  - id: "inf-s1-myrepo"
    # ... existing fields ...
    custom_field: "custom value"
```

#### Step 4: Validate

```bash
npm run validate
```

### Creating Custom Validators

You can add custom validation logic beyond JSON Schema:

**Example: Validate dependency references**

```typescript
// src/utils/validator.ts

export function validateDependencies(repos: Repo[]): ValidationResult {
  const repoNames = new Set(repos.map((r) => r.name));
  const errors: string[] = [];

  for (const repo of repos) {
    if (repo.dependencies?.internal) {
      for (const dep of repo.dependencies.internal) {
        if (!repoNames.has(dep)) {
          errors.push(`${repo.name}: Unknown internal dependency '${dep}'`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
```

---

## Schema Evolution

### Versioning Strategy

We follow semantic versioning for schema changes:

- **Major version (breaking):** Remove required fields, change field types, remove enum values
- **Minor version (backward-compatible):** Add optional fields, add enum values
- **Patch version (clarification):** Update descriptions, fix typos, improve examples

### Migration Guide

When schemas change, follow this process:

#### 1. Create Migration Script

```typescript
// scripts/migrate-schema-v2.ts

import { loadRepos, writeRepos } from "../src/utils/loader.js";

const repos = loadRepos();

// Transform data
for (const repo of repos.repositories) {
  // Example: Rename field
  if ("old_field" in repo) {
    repo.new_field = repo.old_field;
    delete repo.old_field;
  }
}

writeRepos(repos);
```

#### 2. Update Schema Files

Update JSON schemas in `schemas/` with new version.

#### 3. Update Types

Update TypeScript types in `src/types/index.ts`.

#### 4. Run Migration

```bash
ts-node scripts/migrate-schema-v2.ts
```

#### 5. Validate

```bash
npm run validate
```

#### 6. Test

```bash
npm test
```

### Backward Compatibility

To maintain backward compatibility:

1. **Never remove required fields** - Make them optional first, deprecate, then remove in next major version
2. **Always provide defaults** for new required fields
3. **Use `oneOf` or `anyOf`** for alternative schemas during transition periods
4. **Document deprecations** in schema descriptions and CHANGELOG.md

**Example: Deprecating a field**

```json
{
  "properties": {
    "old_field": {
      "type": "string",
      "deprecated": true,
      "description": "DEPRECATED: Use 'new_field' instead. Will be removed in v3.0.0"
    },
    "new_field": {
      "type": "string",
      "description": "Replacement for 'old_field'"
    }
  }
}
```

---

## Best Practices

### 1. Consistent Naming

- Use **lowercase** with **underscores** for IDs and internal names
- Use **Title Case** for human-readable names
- Use **kebab-case** for HTTP paths

### 2. Clear Descriptions

- Start with a verb (e.g., "Provides", "Manages", "Handles")
- Explain **what**, **why**, and **when** to use
- Include **limitations** or **constraints**

### 3. Granular Actions

- One action = one HTTP endpoint
- Split complex operations into multiple actions
- Prefer small, composable actions over large monolithic ones

### 4. Rate Limits

- Always define rate limits for public-facing actions
- Use realistic limits based on expected usage
- Consider different limits for different auth types

### 5. Schema References

- Always provide `input_schema_ref` and `output_schema_ref`
- Keep schemas in separate files for reusability
- Use `$ref` for common schema components

### 6. Examples

- Provide at least one example per action
- Include both success and error cases
- Use realistic data that demonstrates typical usage

---

## Validation Checklist

Before committing changes, verify:

- [ ] All required fields are present
- [ ] IDs follow naming patterns
- [ ] All references (capability_id, repo) are valid
- [ ] JSON schemas are valid JSON Schema Draft 2020-12
- [ ] HTTP paths start with `/`
- [ ] Rate limits are defined for public actions
- [ ] Descriptions are clear and complete
- [ ] Examples are provided
- [ ] `npm run validate` passes
- [ ] `npm test` passes
- [ ] TypeScript compiles without errors

---

## Additional Resources

- [JSON Schema Reference](https://json-schema.org/draft/2020-12/json-schema-core.html)
- [OpenAPI 3.1 Specification](https://spec.openapis.org/oas/v3.1.0)
- [REST API Design Best Practices](https://restfulapi.net/)

---

**Questions? Open an issue or contact the Infrastructure team.**
