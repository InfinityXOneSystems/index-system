import express from 'express';
import { loadYamlFile, validateSchema, loadJsonFile } from '../lib/loader';
import path from 'path';
import { RepoList, ActionsFile } from '../types/index';

const app = express();
app.use(express.json());

function startupValidate() {
  // Validate repos.yml
  const repos = loadYamlFile<RepoList>('repos.yml');
  const repoVal = validateSchema(repos, 'schemas/repos.repo.json');
  if (!repoVal.valid) {
    console.error('repos.yml validation errors:', repoVal.errors);
    throw new Error('repos.yml invalid');
  }

  // Validate actions.yml
  const actions = loadYamlFile<ActionsFile>('actions.yml');
  const actionsVal = validateSchema(actions, 'schemas/actions.action.json');
  if (!actionsVal.valid) {
    console.error('actions.yml validation errors:', actionsVal.errors);
    throw new Error('actions.yml invalid');
  }

  console.log('Startup validation successful');
  return { repos, actions };
}

const { repos, actions } = startupValidate();

app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));
app.get('/readyz', (_req, res) => res.json({ status: 'ready' }));

app.get('/repos', (_req, res) => {
  res.json(repos);
});

app.get('/repos/:id', (req, res) => {
  const r = repos.repos.find((x) => x.id === req.params.id);
  if (!r) {
    return res.status(404).json({ error: 'not found' });
  }
  return res.json(r);
});

app.get('/actions', (_req, res) => res.json(actions.actions));
app.get('/actions/:id', (req, res) => {
  const a = actions.actions.find((x) => x.id === req.params.id);
  if (!a) {
    return res.status(404).json({ error: 'not found' });
  }
  return res.json(a);
});

app.get('/capabilities', (_req, res) => res.json(actions.capabilities));
app.get('/capabilities/:id', (req, res) => {
  const c = actions.capabilities.find((x) => x.id === req.params.id);
  if (!c) {
    return res.status(404).json({ error: 'not found' });
  }
  return res.json(c);
});

app.get('/actions/openapi', (_req, res) => {
  // Serve generated openapi if exists
  const p = path.resolve(process.cwd(), 'generated/openapi-actions.json');
  try {
    const openapi = loadJsonFile(p);
    return res.json(openapi);
  } catch (err) {
    return res.status(404).json({ error: 'OpenAPI not generated. Run index-cli generate-openapi' });
  }
});

// Health-check friendly port
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
if (port < 1 || port > 65535) {
  throw new Error('PORT must be between 1 and 65535');
}
app.listen(port, () => {
  console.log(`Index service listening on ${port}`);
});
