#!/usr/bin/env node

import { Command } from "commander";
import * as YAML from "yaml";
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
import {
  validateAll,
  validateAllRepos,
  validateAllActions,
} from "../utils/validator.js";
import { generateAndWriteOpenAPI } from "../generators/openapi.js";
import { generateAndWriteGraphs } from "../generators/graph.js";
import { Repo, Capability, Action } from "../types/index";

const program = new Command();

program
  .name("index-cli")
  .description(
    "CLI for Infinity XOS Global Index - Tier-0 Capabilities Registry"
  )
  .version("1.0.0");

// ============================================================================
// REPOS COMMANDS
// ============================================================================

const reposCmd = program.command("repos").description("Manage repositories");

reposCmd
  .command("list")
  .description("List all repositories")
  .option("-s, --stage <number>", "Filter by stage (0-10)")
  .option("-d, --domain <string>", "Filter by domain")
  .option("-t, --tier <string>", "Filter by tier (tier_0, tier_1, tier_2)")
  .option("--status <string>", "Filter by status")
  .option("--tag <string>", "Filter by tag")
  .option("-f, --format <format>", "Output format (table|json|yaml)", "table")
  .action((options) => {
    const filters: any = {};
    if (options.stage) filters.stage = parseInt(options.stage);
    if (options.domain) filters.domain = options.domain;
    if (options.tier) filters.tier = options.tier;
    if (options.status) filters.status = options.status;
    if (options.tag) filters.tag = options.tag;

    const repos = filterRepos(filters);

    if (options.format === "json") {
      console.log(JSON.stringify(repos, null, 2));
    } else if (options.format === "yaml") {
      console.log(YAML.stringify(repos));
    } else {
      console.log(
        "\nâ”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”"
      );
      console.log(
        "â”‚ REPOSITORIES                                                        â”‚"
      );
      console.log(
        "â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤"
      );
      repos.forEach((repo: Repo) => {
        console.log(
          `â”‚ ${repo.name.padEnd(25)} â”‚ S${repo.stage} â”‚ ${repo.tier.padEnd(
            7
          )} â”‚ ${repo.status.padEnd(12)} â”‚`
        );
      });
      console.log(
        "â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜"
      );
      console.log(`\nTotal: ${repos.length} repositories\n`);
    }
  });

reposCmd
  .command("show <name>")
  .description("Show detailed information about a repository")
  .option("-f, --format <format>", "Output format (json|yaml)", "yaml")
  .action((name, options) => {
    const repo = getRepo(name);

    if (!repo) {
      console.error(`Repository \'${name}\' not found`);
      process.exit(1);
    }

    if (options.format === "json") {
      console.log(JSON.stringify(repo, null, 2));
    } else {
      console.log(YAML.stringify(repo));
    }
  });

// ============================================================================
// CAPABILITIES COMMANDS
// ============================================================================

const capabilitiesCmd = program
  .command("capabilities")
  .description("Manage capabilities")
  .alias("caps");

capabilitiesCmd
  .command("list")
  .description("List all capabilities")
  .option("-d, --domain <string>", "Filter by domain")
  .option("--tag <string>", "Filter by tag")
  .option("-f, --format <format>", "Output format (table|json|yaml)", "table")
  .action((options) => {
    const filters: any = {};
    if (options.domain) filters.domain = options.domain;
    if (options.tag) filters.tag = options.tag;

    const capabilities = filterCapabilities(filters);

    if (options.format === "json") {
      console.log(JSON.stringify(capabilities, null, 2));
    } else if (options.format === "yaml") {
      console.log(YAML.stringify(capabilities));
    } else {
      console.log(
        "\nâ”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”"
      );
      console.log(
        "â”‚ CAPABILITIES                                                             â”‚"
      );
      console.log(
        "â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤"
      );
      capabilities.forEach((cap: Capability) => {
        console.log(
          `â”‚ ${cap.id.padEnd(35)} â”‚ ${cap.domain.padEnd(12)} â”‚ ${cap.name
            .substring(0, 22)
            .padEnd(22)} â”‚`
        );
      });
      console.log(
        "â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜"
      );
      console.log(`\nTotal: ${capabilities.length} capabilities\n`);
    }
  });

capabilitiesCmd
  .command("show <id>")
  .description("Show detailed information about a capability")
  .option("-f, --format <format>", "Output format (json|yaml)", "yaml")
  .action((id, options) => {
    const capability = getCapability(id);

    if (!capability) {
      console.error(`Capability \'${id}\' not found`);
      process.exit(1);
    }

    if (options.format === "json") {
      console.log(JSON.stringify(capability, null, 2));
    } else {
      console.log(YAML.stringify(capability));
    }
  });

// ============================================================================
// ACTIONS COMMANDS
// ============================================================================

const actionsCmd = program.command("actions").description("Manage actions");

actionsCmd
  .command("list")
  .description("List all actions")
  .option("-r, --repo <string>", "Filter by repository")
  .option("-c, --capability <string>", "Filter by capability ID")
  .option("-d, --domain <string>", "Filter by domain")
  .option("-f, --format <format>", "Output format (table|json|yaml)", "table")
  .action((options) => {
    const filters: any = {};
    if (options.repo) filters.repo = options.repo;
    if (options.capability) filters.capability = options.capability;
    if (options.domain) filters.domain = options.domain;

    const actions = filterActions(filters);

    if (options.format === "json") {
      console.log(JSON.stringify(actions, null, 2));
    } else if (options.format === "yaml") {
      console.log(YAML.stringify(actions));
    } else {
      console.log(
        "\nâ”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”"
      );
      console.log(
        "â”‚ ACTIONS                                                                         â”‚"
      );
      console.log(
        "â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤"
      );
      actions.forEach((action: Action) => {
        const method = action.http.method.padEnd(6);
        const path = action.http.path.substring(0, 30).padEnd(30);
        console.log(
          `â”‚ ${action.id.padEnd(
            30
          )} â”‚ ${method} â”‚ ${path} â”‚ ${action.repo.padEnd(12)} â”‚`
        );
      });
      console.log(
        "â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜"
      );
      console.log(`\nTotal: ${actions.length} actions\n`);
    }
  });

actionsCmd
  .command("show <id>")
  .description("Show detailed information about an action")
  .option("-f, --format <format>", "Output format (json|yaml)", "yaml")
  .action((id, options) => {
    const action = getAction(id);

    if (!action) {
      console.error(`Action \'${id}\' not found`);
      process.exit(1);
    }

    if (options.format === "json") {
      console.log(JSON.stringify(action, null, 2));
    } else {
      console.log(YAML.stringify(action));
    }
  });

// ============================================================================
// VALIDATION COMMANDS
// ============================================================================

const validateCmd = program
  .command("validate")
  .description("Validate configurations");

validateCmd
  .command("repos")
  .description("Validate repos.yml against schema")
  .action(() => {
    const reposData = loadRepos();
    const result = validateAllRepos(reposData);

    console.log("\n=== REPOS VALIDATION ===");
    console.log(`Total repositories: ${result.totalRepos}`);
    console.log(`Valid: ${result.validRepos}`);
    console.log(`Invalid: ${result.invalidRepos.length}`);

    if (result.invalidRepos.length > 0) {
      console.log("\nErrors:");
      result.invalidRepos.forEach(({ name, errors }: {name: string, errors: string[]}) => {
        console.log(`\n  ${name}:`);
        errors.forEach((err) => console.log(`    - ${err}`));
      });
      process.exit(1);
    }

    console.log("\nâœ… All repositories are valid\n");
  });

validateCmd
  .command("actions")
  .description("Validate actions.yml against schema")
  .action(() => {
    const actionsData = loadActions();
    const result = validateAllActions(actionsData);

    console.log("\n=== ACTIONS VALIDATION ===");
    console.log(`Total capabilities: ${result.capabilities.total}`);
    console.log(`Valid capabilities: ${result.capabilities.valid}`);
    console.log(`Invalid capabilities: ${result.capabilities.invalid.length}`);
    console.log(`Total actions: ${result.actions.total}`);
    console.log(`Valid actions: ${result.actions.valid}`);
    console.log(`Invalid actions: ${result.actions.invalid.length}`);

    if (result.capabilities.invalid.length > 0) {
      console.log("\nInvalid capabilities:");
      result.capabilities.invalid.forEach(({ id, errors }: {id: string, errors: string[]}) => {
        console.log(`\n  ${id}:`);
        errors.forEach((err) => console.log(`    - ${err}`));
      });
    }

    if (result.actions.invalid.length > 0) {
      console.log("\nInvalid actions:");
      result.actions.invalid.forEach(({ id, errors }: {id: string, errors: string[]}) => {
        console.log(`\n  ${id}:`);
        errors.forEach((err) => console.log(`    - ${err}`));
      });
    }

    if (!result.valid) {
      process.exit(1);
    }

    console.log("\nâœ… All actions and capabilities are valid\n");
  });

validateCmd
  .command("all")
  .description("Validate all configurations (repos.yml and actions.yml)")
  .action(() => {
    const reposData = loadRepos();
    const actionsData = loadActions();
    const result = validateAll(reposData, actionsData);

    console.log("\n=== FULL CONFIGURATION VALIDATION ===");
    console.log(`Total repositories: ${result.repos.totalRepos}`);
    console.log(`Valid repositories: ${result.repos.validRepos}`);
    console.log(`Invalid repositories: ${result.repos.invalidRepos.length}`);
    console.log(`Total capabilities: ${result.actions.capabilities.total}`);
    console.log(`Valid capabilities: ${result.actions.capabilities.valid}`);
    console.log(`Invalid capabilities: ${result.actions.capabilities.invalid.length}`);
    console.log(`Total actions: ${result.actions.actions.total}`);
    console.log(`Valid actions: ${result.actions.actions.valid}`);
    console.log(`Invalid actions: ${result.actions.actions.invalid.length}`);

    if (result.repos.invalidRepos.length > 0) {
      console.log("\nInvalid repositories:");
      result.repos.invalidRepos.forEach(({ name, errors }: {name: string, errors: string[]}) => {
        console.log(`\n  ${name}:`);
        errors.forEach((err) => console.log(`    - ${err}`));
      });
    }

    if (result.actions.capabilities.invalid.length > 0) {
      console.log("\nInvalid capabilities:");
      result.actions.capabilities.invalid.forEach(({ id, errors }: {id: string, errors: string[]}) => {
        console.log(`\n  ${id}:`);
        errors.forEach((err) => console.log(`    - ${err}`));
      });
    }

    if (result.actions.actions.invalid.length > 0) {
      console.log("\nInvalid actions:");
      result.actions.actions.invalid.forEach(({ id, errors }: {id: string, errors: string[]}) => {
        console.log(`\n  ${id}:`);
        errors.forEach((err) => console.log(`    - ${err}`));
      });
    }

    if (!result.valid) {
      process.exit(1);
    }

    console.log("\nâœ… All configurations are valid\n");
  });

// ============================================================================
// GENERATE COMMANDS
// ============================================================================

const generateCmd = program
  .command("generate")
  .description("Generate various outputs");

generateCmd
  .command("openapi")
  .description("Generate OpenAPI specification from actions.yml")
  .option("-o, --output <path>", "Output file path", "./generated/openapi-actions.json")
  .action((options) => {
    generateAndWriteOpenAPI(options.output);
    console.log(`OpenAPI specification generated at ${options.output}`);
  });

generateCmd
  .command("graph")
  .description("Generate service graph from repos.yml and actions.yml")
  .option("-o, --output <path>", "Output directory", "./generated")
  .option("-f, --format <format>", "Output format (mermaid|dot|json)", "json")
  .action((options) => {
    generateAndWriteGraphs({ stage: options.stage ? parseInt(options.stage) : undefined, domain: options.domain, tier: options.tier });
    console.log(`Service graphs generated in ${options.output} directory.`);
  });

// ============================================================================
// UTILITY COMMANDS (for testing/debugging)
// ============================================================================

program
  .command("repos:list-raw")
  .description("List repos from repos.yml (raw)")
  .action(() => {
    const repos = loadRepos();
    console.table(repos.repos.map((r: Repo) => ({ id: r.id, repo: r.repo, owner: r.owner, stage: r.stage, status: r.status })));
  });

program
  .command("repos:show-raw <id>")
  .description("Show repo by id (raw)")
  .action((id: string) => {
    const repo = getRepo(id);
    if (!repo) {
      console.error("Repo not found:", id);
      process.exit(2);
    }
    console.log(YAML.stringify(repo));
  });

program
  .command("actions:list-raw")
  .description("List actions (raw)")
  .action(() => {
    const actions = loadActions();
    console.table(actions.actions.map((a: Action) => ({ id: a.id, path: a.http.path, method: a.http.method })));
  });

program
  .command("actions:show-raw <id>")
  .description("Show action by id (raw)")
  .action((id: string) => {
    const action = getAction(id);
    if (!action) {
      console.error("Action not found:", id);
      process.exit(2);
    }
    console.log(YAML.stringify(action));
  });

program
  .command("capabilities:list-raw")
  .description("List capabilities (raw)")
  .action(() => {
    const actions = loadActions();
    console.table(actions.capabilities.map((c: Capability) => ({ id: c.id, name: c.name })));
  });

// Parse CLI arguments
program.parse();
