# Integrating Global Index with ChatGPT Actions

This guide explains how to use the Global Index to power ChatGPT Actions, enabling ChatGPT to interact with your Infinity XOS services.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Generating the OpenAPI Specification](#generating-the-openapi-specification)
4. [Importing to ChatGPT](#importing-to-chatgpt)
5. [Authentication Setup](#authentication-setup)
6. [Testing Actions](#testing-actions)
7. [Action Conventions](#action-conventions)
8. [Troubleshooting](#troubleshooting)

---

## Overview

ChatGPT Actions allow ChatGPT to call external APIs to perform real-world tasks on behalf of users. The Global Index serves as the **single source of truth** for all available actions, and automatically generates the OpenAPI 3.1 specification that ChatGPT requires.

**What you can do:**

- "Send an email to john@example.com with subject 'Meeting Update'"
- "Schedule a meeting for tomorrow at 2 PM with the engineering team"
- "Post to Twitter: 'Just launched our new feature!'"
- "Generate an image of a sunset over the ocean"
- "Search my Google Drive for files about Q1 planning"

**Benefits:**

- **Single source of truth:** All actions defined in one place (`config/actions.yml`)
- **Automatic OpenAPI generation:** No manual spec writing
- **Type safety:** Request/response validated against JSON schemas
- **Consistent conventions:** All actions follow same patterns
- **Easy maintenance:** Update actions.yml, regenerate spec, re-import

---

## Architecture

```
┌─────────────┐
│   ChatGPT   │
└──────┬──────┘
       │ Uses OpenAPI spec to discover actions
       ↓
┌──────────────────────────────┐
│  Global Index                │
│  /actions/openapi endpoint   │
└──────────┬───────────────────┘
           │ Routes to services
           ↓
┌──────────────────────────────┐
│  Omni Gateway                │
│  Routes based on action.repo │
└──────────┬───────────────────┘
           │
     ┌─────┴─────┐
     ↓           ↓
┌─────────┐ ┌─────────┐
│Workspace│ │ Social  │  ... (other services)
│ Service │ │ Service │
└─────────┘ └─────────┘
```

**Flow:**

1. ChatGPT loads OpenAPI spec from Global Index
2. User gives a command to ChatGPT
3. ChatGPT maps command to appropriate action
4. ChatGPT calls action endpoint with proper auth
5. Gateway routes request to implementing service
6. Service executes action and returns response
7. ChatGPT presents result to user

---

## Generating the OpenAPI Specification

### Step 1: Define Actions

Ensure all your actions are defined in `config/actions.yml`:

```yaml
capabilities:
  - id: "cap.workspace.email.send"
    name: "Send Email"
    description: "Send transactional or assistant-composed emails via Gmail API"
    domain: "workspace"
    tags: ["gmail", "email"]
    rate_limit:
      requests_per_minute: 60
      requests_per_hour: 1000
    required_permissions:
      - "https://www.googleapis.com/auth/gmail.send"

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
      - name: "Send simple email"
        request:
          to: "user@example.com"
          subject: "Test"
          body: "This is a test"
        response:
          message_id: "msg_123"
          status: "sent"
```

### Step 2: Create JSON Schemas

Create request/response schemas in `schemas/actions/`:

**workspace.send_email.request.json:**

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
    "subject": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200,
      "description": "Email subject"
    },
    "body": {
      "type": "string",
      "minLength": 1,
      "description": "Email body"
    }
  }
}
```

**workspace.send_email.response.json:**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["message_id", "status"],
  "properties": {
    "message_id": {
      "type": "string",
      "description": "Unique message ID"
    },
    "status": {
      "type": "string",
      "enum": ["sent", "queued", "failed"],
      "description": "Send status"
    }
  }
}
```

### Step 3: Generate OpenAPI Spec

```bash
# Using CLI
npm run generate:openapi

# Or using HTTP endpoint
curl http://localhost:3000/actions/openapi > openapi-actions.json
```

This creates `generated/openapi-actions.json`:

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Infinity XOS Global Index API",
    "version": "1.0.0",
    "description": "Tier-0 Global Index and Capabilities Registry",
    "contact": {
      "name": "Infinity XOS Team",
      "url": "https://fullauto.systems"
    }
  },
  "servers": [
    {
      "url": "https://index.fullauto.systems",
      "description": "Production"
    }
  ],
  "paths": {
    "/aura/workspace/send-email": {
      "post": {
        "operationId": "act.workspace.send_email",
        "summary": "Send Email",
        "description": "Send transactional or assistant-composed emails via Gmail API\n\nRate Limits:\n- 60 requests per minute\n- 1000 requests per hour",
        "tags": ["workspace"],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/workspace.send_email.request"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/workspace.send_email.response"
                }
              }
            }
          }
        },
        "security": [
          {
            "apiKey": []
          }
        ]
      }
    }
  },
  "components": {
    "schemas": {
      "workspace.send_email.request": {
        /* ... */
      },
      "workspace.send_email.response": {
        /* ... */
      }
    },
    "securitySchemes": {
      "apiKey": {
        "type": "apiKey",
        "in": "header",
        "name": "X-API-Key"
      }
    }
  }
}
```

---

## Importing to ChatGPT

### Option 1: Direct URL Import

If your Global Index is publicly accessible:

1. Go to **ChatGPT Settings** → **Actions** → **Create New Action**
2. In the **Schema** field, enter:
   ```
   https://index.fullauto.systems/actions/openapi
   ```
3. ChatGPT will fetch and validate the spec
4. Click **Save**

### Option 2: Copy-Paste Import

If your Global Index is private:

1. Generate the spec locally:
   ```bash
   npm run generate:openapi
   cat generated/openapi-actions.json
   ```
2. Go to **ChatGPT Settings** → **Actions** → **Create New Action**
3. Copy the contents of `openapi-actions.json`
4. Paste into the **Schema** field
5. Click **Save**

### Option 3: File Upload

1. Generate the spec:
   ```bash
   npm run generate:openapi
   ```
2. Go to **ChatGPT Settings** → **Actions** → **Create New Action**
3. Click **Import from File**
4. Select `generated/openapi-actions.json`
5. Click **Save**

---

## Authentication Setup

ChatGPT Actions support three authentication methods. Choose based on your security requirements.

### Method 1: API Key (Recommended for Internal Use)

**Best for:** Service-to-service communication, internal tools

**Setup in actions.yml:**

```yaml
actions:
  - id: "act.workspace.send_email"
    auth: "internal_api_key"
    # ...
```

**ChatGPT Configuration:**

1. In ChatGPT Actions settings, select **Authentication Type: API Key**
2. Choose **Header**
3. Header Name: `X-API-Key`
4. Enter your API key (generate from your auth service)
5. Click **Save**

**Implementation:**
Your services should validate the API key:

```typescript
// middleware/auth.ts
export function validateApiKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    return res.status(401).json({ error: "Invalid API key" });
  }
  next();
}
```

### Method 2: OAuth2 (Recommended for User-Facing Actions)

**Best for:** Actions that access user data (email, calendar, drive)

**Setup in actions.yml:**

```yaml
actions:
  - id: "act.workspace.send_email"
    auth: "oauth2"
    # ...
```

**ChatGPT Configuration:**

1. Select **Authentication Type: OAuth2**
2. Choose **Authorization Code Flow**
3. Enter OAuth2 endpoints:
   - Authorization URL: `https://auth.fullauto.systems/oauth/authorize`
   - Token URL: `https://auth.fullauto.systems/oauth/token`
   - Client ID: `your-client-id`
   - Client Secret: `your-client-secret`
   - Scopes: `workspace.email.send workspace.calendar.read`
4. Click **Save**

**Implementation:**
Implement OAuth2 server following RFC 6749:

```typescript
// routes/oauth.ts
app.get("/oauth/authorize", (req, res) => {
  // Show consent screen
  // Redirect to callback with auth code
});

app.post("/oauth/token", async (req, res) => {
  // Validate auth code
  // Issue access token and refresh token
  res.json({
    access_token: "token",
    token_type: "Bearer",
    expires_in: 3600,
    refresh_token: "refresh",
  });
});
```

### Method 3: JWT (For Advanced Use Cases)

**Best for:** Actions requiring fine-grained access control

**Setup in actions.yml:**

```yaml
actions:
  - id: "act.workspace.send_email"
    auth: "jwt"
    # ...
```

**ChatGPT Configuration:**

1. Select **Authentication Type: Bearer Token**
2. Enter JWT token
3. Click **Save**

**Implementation:**

```typescript
import jwt from "jsonwebtoken";

export function validateJWT(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
```

---

## Testing Actions

### Step 1: Test with cURL

Before testing in ChatGPT, verify actions work with cURL:

```bash
# API Key auth
curl -X POST https://index.fullauto.systems/aura/workspace/send-email \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Test from cURL",
    "body": "This is a test"
  }'

# OAuth2 auth
curl -X POST https://index.fullauto.systems/aura/workspace/send-email \
  -H "Authorization: Bearer your-access-token" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Test from cURL",
    "body": "This is a test"
  }'
```

### Step 2: Test in ChatGPT

Once actions are imported, test with natural language prompts:

**Email Actions:**

- "Send an email to john@example.com with subject 'Meeting Update' and body 'The meeting has been rescheduled to 3 PM'"
- "Email the team about tomorrow's standup"

**Calendar Actions:**

- "Schedule a meeting with Alice tomorrow at 2 PM"
- "What's on my calendar for next week?"
- "Create a calendar event for the Q1 review on March 15th"

**Social Actions:**

- "Post to Twitter: 'Excited to announce our new product launch!'"
- "Share on LinkedIn about our latest blog post"

**ML Actions:**

- "Generate an image of a futuristic cityscape"
- "Analyze the sentiment of this text: 'I love this product!'"

### Step 3: Monitor Logs

Check logs on your services to verify requests:

```bash
# Check gateway logs
kubectl logs -f deployment/gateway -n infinity-xos

# Check workspace logs
kubectl logs -f deployment/workspace -n infinity-xos

# Check auth logs
kubectl logs -f deployment/auth -n infinity-xos
```

---

## Action Conventions

To ensure consistency across all actions, follow these conventions:

### Action IDs

- **Format:** `act.{domain}.{verb}_{resource}`
- **Examples:**
  - `act.workspace.send_email`
  - `act.social.post_tweet`
  - `act.ml.generate_image`

### HTTP Paths

- **Format:** `/aura/{domain}/{verb}-{resource}`
- **Examples:**
  - `/aura/workspace/send-email`
  - `/aura/social/post-tweet`
  - `/aura/ml/generate-image`

### Request Bodies

- **Always JSON**
- **Required fields first** in schema
- **Use descriptive property names**
- **Validate all inputs**

Example:

```json
{
  "to": "user@example.com",
  "subject": "Meeting Update",
  "body": "The meeting has been rescheduled",
  "cc": ["manager@example.com"],
  "html": false
}
```

### Response Bodies

- **Always JSON**
- **Include ID for created/modified resources**
- **Include status field**
- **Include timestamp**
- **Include error details on failure**

Success:

```json
{
  "message_id": "msg_abc123",
  "status": "sent",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

Error:

```json
{
  "error": "Invalid recipient email",
  "status": "failed",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Error Handling

- **400** - Invalid request (missing/invalid parameters)
- **401** - Authentication failed (missing/invalid credentials)
- **403** - Authorization failed (insufficient permissions)
- **404** - Resource not found
- **429** - Rate limit exceeded
- **500** - Internal server error

Example error response:

```json
{
  "error": "Rate limit exceeded",
  "status": "failed",
  "retry_after": 60,
  "limit": {
    "requests_per_minute": 60,
    "requests_per_hour": 1000
  }
}
```

### Rate Limits

Always define rate limits in capabilities:

```yaml
capabilities:
  - id: "cap.workspace.email.send"
    rate_limit:
      requests_per_minute: 60
      requests_per_hour: 1000
      requests_per_day: 10000
```

Enforce in services:

```typescript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: { error: "Rate limit exceeded" },
});

app.use("/aura/workspace/", limiter);
```

---

## Troubleshooting

### Issue: ChatGPT can't find the action

**Symptoms:**

- ChatGPT says "I don't have the ability to do that"
- Action doesn't appear in ChatGPT Actions list

**Solutions:**

1. Check OpenAPI spec is valid:
   ```bash
   npm run generate:openapi
   npx @apidevtools/swagger-cli validate generated/openapi-actions.json
   ```
2. Verify action is in `config/actions.yml`
3. Re-import spec to ChatGPT
4. Check `operationId` matches action ID

### Issue: Authentication fails

**Symptoms:**

- ChatGPT gets 401 Unauthorized
- "Authentication failed" error

**Solutions:**

1. **API Key:** Verify key is correct and not expired
   ```bash
   curl -H "X-API-Key: your-key" https://index.fullauto.systems/healthz
   ```
2. **OAuth2:** Check token hasn't expired, refresh if needed
3. **JWT:** Verify JWT secret matches, check expiration time
4. Check auth middleware is applied to route

### Issue: Schema validation errors

**Symptoms:**

- ChatGPT gets 400 Bad Request
- "Invalid request body" error

**Solutions:**

1. Validate request against schema:
   ```bash
   npm run validate
   ```
2. Check all required fields are present
3. Verify field types match schema
4. Look for typos in field names
5. Test with cURL to isolate issue

### Issue: Rate limit exceeded

**Symptoms:**

- ChatGPT gets 429 Too Many Requests
- "Rate limit exceeded" error

**Solutions:**

1. Check current rate limit in capability definition
2. Increase limits if necessary:
   ```yaml
   rate_limit:
     requests_per_minute: 120 # Increased from 60
   ```
3. Implement exponential backoff in ChatGPT
4. Consider caching responses

### Issue: OpenAPI spec not loading

**Symptoms:**

- ChatGPT can't fetch spec from URL
- Import fails with error

**Solutions:**

1. Verify Global Index is running:
   ```bash
   curl http://localhost:3000/healthz
   ```
2. Check CORS is enabled:
   ```typescript
   app.use(cors({ origin: "*" }));
   ```
3. Verify endpoint returns valid JSON:
   ```bash
   curl http://localhost:3000/actions/openapi | jq
   ```
4. Check firewall/network rules allow traffic

### Issue: Action calls wrong endpoint

**Symptoms:**

- Request goes to wrong service
- 404 Not Found errors

**Solutions:**

1. Verify `http.path` in action definition matches actual route
2. Check gateway routing configuration
3. Ensure service is deployed and running
4. Verify DNS/service discovery is working

---

## Best Practices

### 1. Keep Actions Simple

Each action should do **one thing well**. Split complex operations into multiple actions.

❌ **Bad:**

```yaml
- id: "act.workspace.manage_everything"
  # Sends email, creates calendar event, uploads to drive
```

✅ **Good:**

```yaml
- id: "act.workspace.send_email"
- id: "act.workspace.create_event"
- id: "act.workspace.upload_file"
```

### 2. Use Descriptive Names

Action names should clearly describe what they do.

❌ **Bad:**

```yaml
- id: "act.workspace.do_it"
  name: "Do Thing"
```

✅ **Good:**

```yaml
- id: "act.workspace.send_email"
  name: "Send Email"
  description: "Send transactional or assistant-composed emails via Gmail API"
```

### 3. Provide Examples

Always include examples in action definitions:

```yaml
examples:
  - name: "Send simple email"
    request:
      to: "user@example.com"
      subject: "Hello"
      body: "Test message"
    response:
      message_id: "msg_123"
      status: "sent"
```

### 4. Version Your APIs

Include version in HTTP paths:

```yaml
http:
  method: "POST"
  path: "/aura/v1/workspace/send-email" # v1 versioning
```

### 5. Monitor Usage

Track action usage to identify issues:

```typescript
app.post("/aura/workspace/send-email", async (req, res) => {
  // Log request
  logger.info("Action called", {
    action: "act.workspace.send_email",
    user: req.user.id,
    timestamp: new Date(),
  });

  // Execute action
  // ...
});
```

### 6. Test Thoroughly

Test actions with:

- Valid inputs
- Invalid inputs (missing fields, wrong types)
- Edge cases (empty strings, null values)
- Rate limit scenarios
- Authentication failures

---

## Additional Resources

- [OpenAPI 3.1 Specification](https://spec.openapis.org/oas/v3.1.0)
- [ChatGPT Actions Documentation](https://platform.openai.com/docs/actions)
- [JSON Schema Guide](https://json-schema.org/learn/)
- [OAuth2 RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749)

---

**Questions? Contact the Infrastructure team or open an issue on GitHub.**
