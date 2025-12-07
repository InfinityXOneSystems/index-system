import express, { Request, Response, NextFunction } from "express";
import * as fs from "fs";
import * as path from "path";
import {
  loadRepos,
  loadActions,
  getRepo,
  getCapability,
  getAction,
  filterRepos,
  filterCapabilities,
  filterActions,
} from "../utils/loader.js";
import { validateAll } from "../utils/validator.js";
import { generateOpenAPI } from "../generators/openapi.js";
import {
  generateServiceGraph,
  graphToMermaid,
  graphToDot,
} from "../generators/graph.js";

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.resolve(__dirname, "../..");
const GENERATED_DIR = path.join(ROOT_DIR, "generated");

// Middleware
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, X-API-Key"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// ============================================================================
// HEALTH CHECK ENDPOINTS
// ============================================================================

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "infinity-xos-global-index",
    timestamp: new Date().toISOString(),
  });
});

app.get("/healthz", (req, res) => {
  res.json({
    status: "healthy",
    service: "infinity-xos-global-index",
    timestamp: new Date().toISOString(),
  });
});
app.get("/readyz", (req, res) => {
  try {
    // Check if config files exist and can be loaded
    loadRepos();
    loadActions();

    res.json({
      status: "ready",
      service: "infinity-xos-global-index",
      timestamp: new Date().toISOString(),
      checks: {
        repos_config: "ok",
        actions_config: "ok",
      },
    });
  } catch (error) {
    res.status(503).json({
      status: "not ready",
      service: "infinity-xos-global-index",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================================================
// REPOSITORY ENDPOINTS
// ============================================================================

app.get("/repos", (req, res) => {
  try {
    const filters: any = {};
    if (req.query.stage) filters.stage = parseInt(req.query.stage as string);
    if (req.query.domain) filters.domain = req.query.domain as string;
    if (req.query.tier) filters.tier = req.query.tier as string;
    if (req.query.status) filters.status = req.query.status as string;
    if (req.query.tag) filters.tag = req.query.tag as string;

    const repos = filterRepos(filters);

    res.json({
      total: repos.length,
      filters,
      repositories: repos,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to load repositories",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

app.get("/repos/:name", (req, res) => {
  try {
    const repo = getRepo(req.params.name);

    if (!repo) {
      return res.status(404).json({
        error: "Repository not found",
        name: req.params.name,
      });
    }

    res.json(repo);
  } catch (error) {
    res.status(500).json({
      error: "Failed to get repository",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================================================
// CAPABILITY ENDPOINTS
// ============================================================================

app.get("/capabilities", (req, res) => {
  try {
    const filters: any = {};
    if (req.query.domain) filters.domain = req.query.domain as string;
    if (req.query.tag) filters.tag = req.query.tag as string;

    const capabilities = filterCapabilities(filters);

    res.json({
      total: capabilities.length,
      filters,
      capabilities,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to load capabilities",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

app.get("/capabilities/:id", (req, res) => {
  try {
    const capability = getCapability(req.params.id);

    if (!capability) {
      return res.status(404).json({
        error: "Capability not found",
        id: req.params.id,
      });
    }

    res.json(capability);
  } catch (error) {
    res.status(500).json({
      error: "Failed to get capability",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================================================
// ACTION ENDPOINTS
// ============================================================================

app.get("/actions", (req, res) => {
  try {
    const filters: any = {};
    if (req.query.repo) filters.repo = req.query.repo as string;
    if (req.query.capability)
      filters.capability = req.query.capability as string;
    if (req.query.domain) filters.domain = req.query.domain as string;

    const actions = filterActions(filters);

    res.json({
      total: actions.length,
      filters,
      actions,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to load actions",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

app.get("/actions/:id", (req, res) => {
  try {
    const action = getAction(req.params.id);

    if (!action) {
      return res.status(404).json({
        error: "Action not found",
        id: req.params.id,
      });
    }

    res.json(action);
  } catch (error) {
    res.status(500).json({
      error: "Failed to get action",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================================================
// OPENAPI ENDPOINT
// ============================================================================

app.get("/actions/openapi", (req, res) => {
  try {
    // Check if pre-generated spec exists
    const specPath = path.join(GENERATED_DIR, "openapi-actions.json");

    if (fs.existsSync(specPath)) {
      const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
      return res.json(spec);
    }

    // Generate on-the-fly if not found
    console.log("Generating OpenAPI spec on-the-fly...");
    const spec = generateOpenAPI();
    res.json(spec);
  } catch (error) {
    res.status(500).json({
      error: "Failed to generate OpenAPI spec",
      message: error instanceof Error ? error.message : String(error),
      hint: "Run `npm run generate:openapi` to pre-generate the spec",
    });
  }
});

// ============================================================================
// GRAPH ENDPOINTS
// ============================================================================

app.get("/graph/services", (req, res) => {
  try {
    const filters: any = {};
    if (req.query.stage) filters.stage = parseInt(req.query.stage as string);
    if (req.query.domain) filters.domain = req.query.domain as string;
    if (req.query.tier) filters.tier = req.query.tier as string;

    const format = (req.query.format as string) || "json";
    const graph = generateServiceGraph(undefined, filters);

    if (format === "mermaid") {
      res.setHeader("Content-Type", "text/plain");
      return res.send(graphToMermaid(graph));
    }

    if (format === "dot") {
      res.setHeader("Content-Type", "text/plain");
      return res.send(graphToDot(graph));
    }

    // Default to JSON
    res.json(graph);
  } catch (error) {
    res.status(500).json({
      error: "Failed to generate service graph",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================================================
// VALIDATION ENDPOINT
// ============================================================================

app.get("/validate", (req, res) => {
  try {
    const reposData = loadRepos();
    const actionsData = loadActions();
    const result = validateAll(reposData, actionsData);

    res.json({
      valid: result.valid,
      summary: {
        repos: {
          total: result.repos.totalRepos,
          valid: result.repos.validRepos,
          invalid: result.repos.invalidRepos.length,
        },
        capabilities: {
          total: result.actions.capabilities.total,
          valid: result.actions.capabilities.valid,
          invalid: result.actions.capabilities.invalid.length,
        },
        actions: {
          total: result.actions.actions.total,
          valid: result.actions.actions.valid,
          invalid: result.actions.actions.invalid.length,
        },
      },
      details: {
        invalidRepos: result.repos.invalidRepos,
        invalidCapabilities: result.actions.capabilities.invalid,
        invalidActions: result.actions.actions.invalid,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to validate configurations",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================================================
// ROOT ENDPOINT
// ============================================================================

app.get("/", (req, res) => {
  res.json({
    service: "Infinity XOS Global Index",
    version: "1.0.0",
    description: "Tier-0 Global Index and Capabilities Registry",
    endpoints: {
      health: {
        "/healthz": "Health check",
        "/readyz": "Readiness check",
      },
      repositories: {
        "GET /repos": "List all repositories (supports filtering)",
        "GET /repos/:name": "Get specific repository",
      },
      capabilities: {
        "GET /capabilities": "List all capabilities (supports filtering)",
        "GET /capabilities/:id": "Get specific capability",
      },
      actions: {
        "GET /actions": "List all actions (supports filtering)",
        "GET /actions/:id": "Get specific action",
        "GET /actions/openapi": "Get OpenAPI 3.1 specification",
      },
      graph: {
        "GET /graph/services":
          "Get service dependency graph (supports format=json|mermaid|dot)",
      },
      validation: {
        "GET /validate": "Validate all configurations",
      },
    },
    documentation: "https://github.com/InfinityXOneSystems/index",
  });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`\n🚀 Infinity XOS Global Index (Tier-0) started`);
  console.log(`📍 Listening on http://localhost:${PORT}`);
  console.log(`📖 API docs at http://localhost:${PORT}/\n`);

  // Validate on startup
  try {
    const reposData = loadRepos();
    const actionsData = loadActions();
    const result = validateAll(reposData, actionsData);

    if (result.valid) {
      console.log("✅ All configurations validated successfully");
      console.log(`   - ${result.repos.totalRepos} repositories`);
      console.log(`   - ${result.actions.capabilities.total} capabilities`);
      console.log(`   - ${result.actions.actions.total} actions\n`);
    } else {
      console.warn("⚠️  Configuration validation warnings:");
      if (result.repos.invalidRepos.length > 0) {
        console.warn(
          `   - ${result.repos.invalidRepos.length} invalid repositories`
        );
      }
      if (result.actions.capabilities.invalid.length > 0) {
        console.warn(
          `   - ${result.actions.capabilities.invalid.length} invalid capabilities`
        );
      }
      if (result.actions.actions.invalid.length > 0) {
        console.warn(
          `   - ${result.actions.actions.invalid.length} invalid actions`
        );
      }
      console.warn("");
    }
  } catch (error) {
    console.error("❌ Failed to validate configurations on startup:", error);
  }
});

export default app;
