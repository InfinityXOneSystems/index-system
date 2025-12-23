# Infinity XOS Global Index (Tier-0)

**Enterprise-Grade Global Index & Capabilities Registry for Infinity XOS / fullauto.systems**

The Global Index is the **Tier-0 foundational service** that provides a single source of truth for:

- All repositories and services across the Infinity XOS ecosystem
- All capabilities and actions available across the platform
- Service dependency graphs and architecture visualization
- Machine-readable API specifications (OpenAPI 3.1) for agents, gateways, and integrations

## 🎯 Purpose

This service is the **first point of discovery** for:

- **Aura AI** (voice assistant) - discovering available actions
- **Omni Gateway** - routing requests to appropriate services
- **Auto-Engineer** and other agents - finding capabilities and APIs
- **ChatGPT Actions** - OpenAI JSON integration via OpenAPI specs
- **Google Workspace** integrations - calendar, email, tasks, drive
- **Social integrations** - posting, analytics
- **ML/AI workflows** - image generation, text analysis

## 🏗️ Architecture

```
index/
├── config/
│   ├── repos.yml          # 37 repositories with metadata
│   └── actions.yml        # 12 capabilities, 12+ actions
├── schemas/
│   ├── repos/             # JSON Schema for repo validation
│   ├── capabilities/      # JSON Schema for capability validation
│   └── actions/           # JSON Schema for action validation + samples
├── src/
│   ├── cli/               # CLI tool for local queries
│   ├── server/            # HTTP API service
│   ├── utils/             # Loader and validator utilities
│   ├── generators/        # OpenAPI and graph generators
│   └── types/             # TypeScript type definitions
├── tests/                 # Jest test suite
└── generated/             # Generated OpenAPI specs and graphs
```

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/InfinityXOneSystems/index.git
cd index

# Install dependencies
npm install

# Build TypeScript
npm run build
```

## 🚀 Quick Start

### CLI Usage

```bash
# List all repositories
npm run repos:list

# List repositories by tier
npm run repos:list -- --tier tier_0

# Show specific repository
npm run repos:show gateway

# List all capabilities
npm run capabilities:list

# List capabilities by domain
npm run capabilities:list -- --domain workspace

# Show specific capability
npm run capabilities:show cap.workspace.email.send

# List all actions
npm run actions:list

# Filter actions by repo
npm run actions:list -- --repo workspace

# Show specific action
npm run actions:show act.workspace.send_email

# Validate configurations
npm run validate

# Generate OpenAPI spec
npm run generate:openapi

# Generate service dependency graph
npm run graph:services
```

### HTTP API

```bash
# Start the server
npm start

# Or in development mode with auto-reload
npm run dev
```

The server will start on `http://localhost:3000` (or `$PORT` if set).

## 📡 API Endpoints

### Health Checks

- `GET /healthz` - Health check
- `GET /readyz` - Readiness check

### Repositories

- `GET /repos` - List all repositories
  - Query params: `stage`, `domain`, `tier`, `status`, `tag`
- `GET /repos/:name` - Get specific repository

### Capabilities

- `GET /capabilities` - List all capabilities
  - Query params: `domain`, `tag`
- `GET /capabilities/:id` - Get specific capability

### Actions

- `GET /actions` - List all actions
  - Query params: `repo`, `capability`, `domain`
- `GET /actions/:id` - Get specific action
- `GET /actions/openapi` - Get OpenAPI 3.1 specification

### Graphs

- `GET /graph/services` - Get service dependency graph
  - Query params: `stage`, `domain`, `tier`, `format` (json|mermaid|dot)

### Validation

- `GET /validate` - Validate all configurations

### Example Requests

```bash
# Get all tier-0 repositories
curl http://localhost:3000/repos?tier=tier_0

# Get workspace capabilities
curl http://localhost:3000/capabilities?domain=workspace

# Get actions for a specific repo
curl http://localhost:3000/actions?repo=workspace

# Get OpenAPI spec for ChatGPT Actions
curl http://localhost:3000/actions/openapi > openapi.json

# Get service graph as Mermaid diagram
curl http://localhost:3000/graph/services?format=mermaid > graph.mmd
```

## 🔧 Configuration Files

### repos.yml

Defines all repositories in the ecosystem:

```yaml
repositories:
  - id: "inf-s0-index"
    name: "index"
    repo: "InfinityXOneSystems/index"
    stage: 0
    domain: "infrastructure"
    tier: "tier_0"
    status: "active"
    runtime: true
    tags: ["registry", "discovery", "tier-0"]
    description: "Global Index and Capabilities Registry"
    # ... more fields
```

**Key Fields:**

- `id` - Unique identifier (format: `inf-s{stage}-{name}`)
- `stage` - Development stage (0-10)
- `tier` - Architecture tier (`tier_0`, `tier_1`, `tier_2`)
- `domain` - Domain category
- `runtime` - Whether service runs as a server
- `entrypoints` - API endpoints, workers, CLI commands
- `datastores` - Databases used
- `dependencies` - Internal and external dependencies

### actions.yml

Defines all capabilities and actions:

```yaml
capabilities:
  - id: "cap.workspace.email.send"
    name: "Send Email"
    description: "Send transactional or assistant-composed emails via Gmail API"
    domain: "workspace"
    tags: ["gmail", "email", "outbound"]
    rate_limit:
      requests_per_minute: 60
      requests_per_hour: 1000

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
```

**Capability Fields:**

- `id` - Format: `cap.{domain}.{resource}.{verb}`
- `domain` - One of: workspace, social, agents, ml
- `rate_limit` - Request rate limits

**Action Fields:**

- `id` - Format: `act.{domain}.{verb}_{resource}`
- `capability_id` - Links to capability
- `http` - HTTP method and path
- `auth` - Auth type: `internal_api_key`, `oauth2`, `jwt`, `public`
- `input_schema_ref` / `output_schema_ref` - JSON Schema refs

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔍 Validation

All configurations are validated against JSON schemas:

```bash
# Validate repos.yml
npm run validate -- repos

# Validate actions.yml
npm run validate -- actions

# Validate everything
npm run validate -- all
```

## 📊 Generating Specs

### OpenAPI Specification

Generate OpenAPI 3.1 spec for use with ChatGPT Actions or API clients:

```bash
npm run generate:openapi
```

Output: `generated/openapi-actions.json`

This spec includes:

- All action endpoints with request/response schemas
- Security schemes (API Key, OAuth2, JWT)
- Rate limits and permissions
- Tags by domain

### Service Dependency Graph

Generate visual dependency graphs:

```bash
npm run graph:services
```

Outputs:

- `generated/service-graph.json` - JSON format for programmatic use
- `generated/service-graph.mmd` - Mermaid diagram syntax
- `generated/service-graph.dot` - Graphviz DOT format

## 🔗 Integration with Other Services

### ChatGPT Actions

1. Generate OpenAPI spec:

   ```bash
   npm run generate:openapi
   ```

2. Upload `generated/openapi-actions.json` to ChatGPT Actions configuration

3. Configure authentication (API Key or OAuth2)

4. Test with prompts like:
   - "Send an email to john@example.com"
   - "Schedule a meeting tomorrow at 2pm"
   - "Create a social media post about our new feature"

### Omni Gateway

The gateway should query this index on startup to discover all available actions and their routing information:

```typescript
const response = await fetch("http://index:3000/actions");
const { actions } = await response.json();

// Build routing table
for (const action of actions) {
  router.register(action.http.path, action.http.method, action.repo);
}
```

### Aura AI (Voice Assistant)

Aura queries the index to discover capabilities:

```typescript
// Get all workspace capabilities
const caps = await fetch("http://index:3000/capabilities?domain=workspace");
const { capabilities } = await caps.json();

// Build voice command handlers
for (const cap of capabilities) {
  voiceEngine.register(cap.name, cap.description, cap.id);
}
```

### Auto-Engineer and Agents

Agents query the index to find relevant APIs:

```typescript
// Find actions for a specific task
const actions = await fetch("http://index:3000/actions?domain=ml");
const { actions: mlActions } = await actions.json();

// Use actions in autonomous workflows
for (const action of mlActions) {
  agent.addCapability(action.id, action.http);
}
```

## 🔐 Security

### Authentication

The HTTP API supports multiple auth methods:

- **Internal API Key** (X-API-Key header) - For service-to-service
- **OAuth2** - For user-delegated access
- **JWT** - For authenticated requests
- **Public** - For public endpoints

Set auth requirements in `actions.yml`:

```yaml
actions:
  - id: "act.workspace.send_email"
    auth: "internal_api_key" # Require API key
```

### Environment Variables

```bash
PORT=3000                    # Server port
API_KEY_SECRET=xxx           # API key secret for validation
OAUTH2_CLIENT_ID=xxx         # OAuth2 configuration
OAUTH2_CLIENT_SECRET=xxx
JWT_SECRET=xxx               # JWT signing secret
```

## 📈 Monitoring

### Health Checks

```bash
# Liveness probe
curl http://localhost:3000/healthz

# Readiness probe (includes config validation)
curl http://localhost:3000/readyz
```

### Metrics

The index can export metrics to monitoring systems:

- Request count by endpoint
- Validation errors
- Configuration reload events

(TODO: Implement Prometheus metrics endpoint)

## 🛠️ Development

### Adding a New Repository

1. Edit `config/repos.yml`:

   ```yaml
   repositories:
     - id: "inf-s1-myservice"
       name: "myservice"
       repo: "InfinityXOneSystems/myservice"
       stage: 1
       domain: "application"
       tier: "tier_1"
       status: "active"
       # ... more fields
   ```

2. Validate:
   ```bash
   npm run validate -- repos
   ```

### Adding a New Capability

1. Edit `config/actions.yml`:

   ```yaml
   capabilities:
     - id: "cap.mydomain.myaction"
       name: "My Action"
       description: "Description of what this does"
       domain: "mydomain"
       tags: ["tag1", "tag2"]
   ```

2. Add corresponding action(s):

   ```yaml
   actions:
     - id: "act.mydomain.do_something"
       capability_id: "cap.mydomain.myaction"
       repo: "myservice"
       service: "myservice-api"
       http:
         method: "POST"
         path: "/api/v1/do-something"
       auth: "internal_api_key"
   ```

3. Create JSON schemas for request/response:

   - `schemas/actions/mydomain.do_something.request.json`
   - `schemas/actions/mydomain.do_something.response.json`

4. Validate:

   ```bash
   npm run validate -- actions
   ```

5. Regenerate OpenAPI:
   ```bash
   npm run generate:openapi
   ```

## 📚 Documentation

- [Schema Documentation](docs/SCHEMA.md) - Detailed schema reference
- [ChatGPT Actions Guide](docs/ACTIONS_FOR_CHATGPT.md) - Integrating with ChatGPT
- [Architecture](docs/ARCHITECTURE.md) - System architecture and design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add/update configs in `config/`
4. Add corresponding schemas in `schemas/`
5. Run validation and tests
6. Submit a pull request

## 📄 License

ISC

## 🔗 Links

- **Repository:** https://github.com/InfinityXOneSystems/index
- **Organization:** https://github.com/InfinityXOneSystems
- **Gateway:** https://github.com/InfinityXOneSystems/gateway
- **Workspace:** https://github.com/InfinityXOneSystems/workspace
- **Agents:** https://github.com/InfinityXOneSystems/agents

---

**Tier-0 Foundation | Infinity XOS | fullauto.systems**
# Infinity XOne Systems Index

Central repository hub for the **Infinity XOne System** - providing a comprehensive index of all systems, subsystems, repositories, and resources within the InfinityXOneSystems organization.

## Core Foundation

| Repository | Description | Status |
|------------|-------------|--------|
| [foundation](https://github.com/InfinityXOneSystems/foundation) | Core foundation and infrastructure for the Infinity XOne System | [![Foundation](https://img.shields.io/github/last-commit/InfinityXOneSystems/foundation)](https://github.com/InfinityXOneSystems/foundation) |

## Systems & Subsystems

| Repository | Description | Status |
|------------|-------------|--------|
| [infinity_codex](https://github.com/InfinityXOneSystems/infinity_codex) | Infinity Codex system | [![Codex](https://img.shields.io/github/last-commit/InfinityXOneSystems/infinity_codex)](https://github.com/InfinityXOneSystems/infinity_codex) |
| [quantum_x_builder](https://github.com/InfinityXOneSystems/quantum_x_builder) | Quantum X Builder system | [![Builder](https://img.shields.io/github/last-commit/InfinityXOneSystems/quantum_x_builder)](https://github.com/InfinityXOneSystems/quantum_x_builder) |
| [agents](https://github.com/InfinityXOneSystems/agents) | AI Agents and automation systems | [![Agents](https://img.shields.io/github/last-commit/InfinityXOneSystems/agents)](https://github.com/InfinityXOneSystems/agents) |

## Applications

| Repository | Description | Status |
|------------|-------------|--------|
| [frontend](https://github.com/InfinityXOneSystems/frontend) | Frontend application | [![Frontend](https://img.shields.io/github/last-commit/InfinityXOneSystems/frontend)](https://github.com/InfinityXOneSystems/frontend) |
| [mvp](https://github.com/InfinityXOneSystems/mvp) | Minimum Viable Product | [![MVP](https://img.shields.io/github/last-commit/InfinityXOneSystems/mvp)](https://github.com/InfinityXOneSystems/mvp) |

## Enterprise & Production

| Repository | Description | Status |
|------------|-------------|--------|
| [enterprise](https://github.com/InfinityXOneSystems/enterprise) | Enterprise edition and features | [![Enterprise](https://img.shields.io/github/last-commit/InfinityXOneSystems/enterprise)](https://github.com/InfinityXOneSystems/enterprise) |
| [production](https://github.com/InfinityXOneSystems/production) | Production environment and deployment | [![Production](https://img.shields.io/github/last-commit/InfinityXOneSystems/production)](https://github.com/InfinityXOneSystems/production) |
| [industries](https://github.com/InfinityXOneSystems/industries) | Industry-specific solutions | [![Industries](https://img.shields.io/github/last-commit/InfinityXOneSystems/industries)](https://github.com/InfinityXOneSystems/industries) |

## Infrastructure & Setup

| Repository | Description | Status |
|------------|-------------|--------|
| [bootstrap](https://github.com/InfinityXOneSystems/bootstrap) | Bootstrap and initial setup | [![Bootstrap](https://img.shields.io/github/last-commit/InfinityXOneSystems/bootstrap)](https://github.com/InfinityXOneSystems/bootstrap) |

## Documentation

| Repository | Description | Status |
|------------|-------------|--------|
| [docs](https://github.com/InfinityXOneSystems/docs) | Documentation and guides | [![Docs](https://img.shields.io/github/last-commit/InfinityXOneSystems/docs)](https://github.com/InfinityXOneSystems/docs) |

---

## Quick Links

- **Organization**: [InfinityXOneSystems](https://github.com/InfinityXOneSystems)
- **Primary Repository**: [foundation](https://github.com/InfinityXOneSystems/foundation)

## Getting Started

To get started with the Infinity XOne System, begin with the [foundation](https://github.com/InfinityXOneSystems/foundation) repository which contains the core infrastructure and setup instructions.

## Contributing

Please refer to individual repository README files for contribution guidelines specific to each project.

## License

See individual repositories for license information.
