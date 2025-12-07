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
  tier: number;
  status: string;
  tags?: string[];
  owner: string;
  languages?: string[];
  runtime?: string;
  entrypoints?: Entrypoint[];
  datastores?: Array<{ type: string; name: string }>;
  dependencies?: { internal?: string[]; external?: string[] };
};

export type RepoList = {
  repos: RepoMeta[];
};

export type Capability = {
  id: string;
  name: string;
  description: string;
  tags?: string[];
  auth: string;
};

export type ActionHttp = {
  method: string;
  path: string;
};

export type Action = {
  id: string;
  name: string;
  capability_id: string;
  repo: string;
  service: string;
  http: ActionHttp;
  auth?: string;
  request_schema?: string;
  response_schema?: string;
  description?: string;
};

export type ActionsFile = {
  capabilities: Capability[];
  actions: Action[];
};
