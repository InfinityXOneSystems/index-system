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
        "\n┌─────────────────────────────────────────────────────────────────────┐"
      );
      console.log(
        "│ REPOSITORIES                                                        │"
      );
      console.log(
        "├─────────────────────────────────────────────────────────────────────┤"
      );
      repos.forEach((repo) => {
        console.log(
          `│ ${repo.name.padEnd(25)} │ S${repo.stage} │ ${repo.tier.padEnd(
            7
          )} │ ${repo.status.padEnd(12)} │`
        );
      });
      console.log(
        "└─────────────────────────────────────────────────────────────────────┘"
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
      console.error(`Repository '${name}' not found`);
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
        "\n┌──────────────────────────────────────────────────────────────────────────┐"
      );
      console.log(
        "│ CAPABILITIES                                                             │"
      );
      console.log(
        "├──────────────────────────────────────────────────────────────────────────┤"
      );
      capabilities.forEach((cap) => {
        console.log(
          `│ ${cap.id.padEnd(35)} │ ${cap.domain.padEnd(12)} │ ${cap.name
            .substring(0, 22)
            .padEnd(22)} │`
        );
      });
      console.log(
        "└──────────────────────────────────────────────────────────────────────────┘"
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
      console.error(`Capability '${id}' not found`);
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
        "\n┌─────────────────────────────────────────────────────────────────────────────────┐"
      );
      console.log(
        "│ ACTIONS                                                                         │"
      );
      console.log(
        "├─────────────────────────────────────────────────────────────────────────────────┤"
      );
      actions.forEach((action) => {
        const method = action.http.method.padEnd(6);
        const path = action.http.path.substring(0, 30).padEnd(30);
        console.log(
          `│ ${action.id.padEnd(
            30
          )} │ ${method} │ ${path} │ ${action.repo.padEnd(12)} │`
        );
      });
      console.log(
        "└─────────────────────────────────────────────────────────────────────────────────┘"
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
      console.error(`Action '${id}' not found`);
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
      result.invalidRepos.forEach(({ name, errors }) => {
        console.log(`\n  ${name}:`);
        errors.forEach((err) => console.log(`    - ${err}`));
      });
      process.exit(1);
    }

    console.log("\n✅ All repositories are valid\n");
  });

validateCmd
  .command("actions")
  .description("Validate actions.yml against schema")
  .action(() => {
    const actionsData = loadActions();
    const result = validateAllActions(actionsData);

    console.log("\n=== ACTIONS VALIDATION ===");
    console.log(
      `\nCapabilities: ${result.capabilities.valid}/${result.capabilities.total} valid`
    );
    console.log(
      `Actions: ${result.actions.valid}/${result.actions.total} valid`
    );

    if (result.capabilities.invalid.length > 0) {
      console.log("\nInvalid capabilities:");
      result.capabilities.invalid.forEach(({ id, errors }) => {
        console.log(`\n  ${id}:`);
        errors.forEach((err) => console.log(`    - ${err}`));
      });
    }

    if (result.actions.invalid.length > 0) {
      console.log("\nInvalid actions:");
      result.actions.invalid.forEach(({ id, errors }) => {
        console.log(`\n  ${id}:`);
        errors.forEach((err) => console.log(`    - ${err}`));
      });
    }

    if (!result.valid) {
      process.exit(1);
    }

    console.log("\n✅ All capabilities and actions are valid\n");
  });

validateCmd
  .command("all")
  .description("Validate both repos.yml and actions.yml")
  .action(() => {
    const reposData = loadRepos();
    const actionsData = loadActions();
    const result = validateAll(reposData, actionsData);

    console.log("\n=== FULL VALIDATION ===");
    console.log(
      `\nRepositories: ${result.repos.validRepos}/${result.repos.totalRepos} valid`
    );
    console.log(
      `Capabilities: ${result.actions.capabilities.valid}/${result.actions.capabilities.total} valid`
    );
    console.log(
      `Actions: ${result.actions.actions.valid}/${result.actions.actions.total} valid`
    );

    if (!result.valid) {
      console.log("\n❌ Validation failed - see errors above\n");
      process.exit(1);
    }

    console.log("\n✅ All configurations are valid\n");
  });

// ============================================================================
// GENERATE COMMANDS
// ============================================================================

const generateCmd = program
  .command("generate")
  .description("Generate specifications and docs")
  .alias("gen");

generateCmd
  .command("openapi")
  .description("Generate OpenAPI 3.1 specification from actions.yml")
  .option("-o, --output <filename>", "Output filename", "openapi-actions.json")
  .action((options) => {
    console.log("\nGenerating OpenAPI 3.1 specification...");

    const { spec, path: outputPath } = generateAndWriteOpenAPI(options.output);

    console.log(`\n✅ Generated OpenAPI spec:`);
    console.log(`   Path: ${outputPath}`);
    console.log(`   Paths: ${Object.keys(spec.paths).length}`);
    console.log(
      `   Schemas: ${Object.keys(spec.components?.schemas || {}).length}`
    );
    console.log(`   Tags: ${spec.tags?.length || 0}\n`);
  });

generateCmd
  .command("graph")
  .description("Generate service dependency graph")
  .option("-s, --stage <number>", "Filter by stage")
  .option("-d, --domain <string>", "Filter by domain")
  .option("-t, --tier <string>", "Filter by tier")
  .action((options) => {
    console.log("\nGenerating service dependency graph...");

    const filters: any = {};
    if (options.stage) filters.stage = parseInt(options.stage);
    if (options.domain) filters.domain = options.domain;
    if (options.tier) filters.tier = options.tier;

    const paths = generateAndWriteGraphs(filters);

    console.log(`\n✅ Generated graphs:`);
    console.log(`   JSON: ${paths.json}`);
    console.log(`   Mermaid: ${paths.mermaid}`);
    console.log(`   DOT: ${paths.dot}\n`);
  });

// Parse CLI arguments
program.parse();
