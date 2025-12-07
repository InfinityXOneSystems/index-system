/**
 * Infinity XOS Global Index - Type Definitions
 *
 * Core TypeScript types for the Index service
 */

// ========================================
// REPOSITORY TYPES
// ========================================

export type Entrypoint = {
  type: string;
  url?: string;
  routes?: string[];
};

export type RepoMeta = {
  id: string;
  name: string;
  repo: string;
  stage: number;
  domain: string;
  tier: "tier_0" | "tier_1" | "tier_2";
  status: "active" | "partial" | "scaffold" | "experimental" | "deprecated";
  runtime?: boolean;
  stack?: string;
  tags?: string[];
  description?: string;
  owner?: string;
  languages?: string[];
  runtime_env?: string;
  entrypoints?: RepoEntrypoints;
  datastores?: Datastore[];
  dependencies?: RepoDependencies;
  health_endpoint?: string;
}

export interface RepoEntrypoints {
  api?: ApiEndpoint[];
  workers?: string[];
  cli?: string[];
}

export interface ApiEndpoint {
  path: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  description?: string;
}

export interface Datastore {
  type: "postgres" | "redis" | "firestore" | "mongodb" | "s3" | "gcs";
  name: string;
  description?: string;
}

export interface RepoDependencies {
  internal?: string[];
  external?: string[];
}

// ========================================
// CAPABILITY TYPES
// ========================================

export interface Capability {
  id: string;
  name: string;
  description: string;
  domain: string;
  tags?: string[];
  default_owner_repo?: string;
  required_permissions?: string[];
  rate_limit?: RateLimit;
}

export interface RateLimit {
  requests_per_minute?: number;
  requests_per_hour?: number;
}

// ========================================
// ACTION TYPES
// ========================================

export interface Action {
  id: string;
  capability_id: string;
  repo: string;
  service: string;
  http: HttpConfig;
  auth: "internal_api_key" | "oauth2" | "jwt" | "public";
  input_schema_ref?: string;
  output_schema_ref?: string;
  description?: string;
  examples?: ActionExample[];
  deprecated?: boolean;
  deprecation_notice?: string;
}

export interface HttpConfig {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  base_url?: string;
}

export interface ActionExample {
  name: string;
  description?: string;
  input: any;
  output: any;
}

// ========================================
// INDEX DATA TYPES
// ========================================

export interface IndexData {
  repos: Repo[];
  capabilities: Capability[];
  actions: Action[];
}

export interface ReposYaml {
  repos: Repo[];
  metadata?: {
    total_repos: number;
    active: number;
    partial: number;
    scaffold: number;
    last_updated: string;
    maintained_by: string;
  };
}

export interface ActionsYaml {
  capabilities: Capability[];
  actions: Action[];
}

// ========================================
// OPENAPI TYPES
// ========================================

export interface OpenAPISpec {
  openapi: string;
  info: OpenAPIInfo;
  servers: OpenAPIServer[];
  paths: Record<string, PathItem>;
  components?: OpenAPIComponents;
  tags?: Array<{ name: string; description?: string }>;
}

export interface OpenAPIInfo {
  title: string;
  version: string;
  description?: string;
  contact?: {
    name?: string;
    url?: string;
    email?: string;
  };
}

export interface OpenAPIServer {
  url: string;
  description?: string;
}

export interface PathItem {
  get?: Operation;
  post?: Operation;
  put?: Operation;
  patch?: Operation;
  delete?: Operation;
}

export interface Operation {
  operationId: string;
  summary?: string;
  description?: string;
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses: Record<string, Response>;
  security?: SecurityRequirement[];
  tags?: string[];
}

export interface Parameter {
  name: string;
  in: "path" | "query" | "header";
  required?: boolean;
  schema: any;
  description?: string;
}

export interface RequestBody {
  required?: boolean;
  content: Record<string, MediaType>;
}

export interface MediaType {
  schema: any;
}

export interface Response {
  description: string;
  content?: Record<string, MediaType>;
}

export interface SecurityRequirement {
  [key: string]: string[];
}

export interface OpenAPIComponents {
  schemas?: Record<string, any>;
  securitySchemes?: Record<string, SecurityScheme>;
}

export interface SecurityScheme {
  type: string;
  scheme?: string;
  bearerFormat?: string;
  in?: string;
  name?: string;
  description?: string;
  flows?: {
    authorizationCode?: {
      authorizationUrl: string;
      tokenUrl: string;
      scopes: Record<string, string>;
    };
  };
}

// ========================================
// CLI TYPES
// ========================================

export interface CliOptions {
  format?: "table" | "json" | "yaml";
  stage?: number;
  domain?: string;
  tier?: string;
  status?: string;
  tag?: string;
  repo?: string;
  capability?: string;
  output?: string;
}

// ========================================
// GRAPH TYPES
// ========================================

export interface ServiceGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphNode {
  id: string;
  name: string;
  type: "repo" | "external" | "service";
  stage?: number;
  tier?: string;
  status?: string;
  metadata?: {
    stage?: number;
    domain?: string;
    tier?: string;
    status?: string;
    runtime?: boolean;
    tags?: string[];
  };
}

export interface GraphEdge {
  from: string;
  to: string;
  type: "internal" | "external";
  label?: string;
}

// Alias types for backward compatibility
export type Repo = RepoMeta;
export type RepoList = ReposYaml;
export type ActionsFile = ActionsYaml;
