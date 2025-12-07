#!/usr/bin/env node
import { program } from 'commander';
import { loadYamlFile } from '../lib/loader';
import fs from 'fs';
import path from 'path';
import { ActionsFile, RepoList } from '../types/index';

program.name('index-cli').description('Global Index CLI').version('0.1.0');

program
  .command('repos:list')
  .description('List repos from repos.yml')
  .action(() => {
    const repos = loadYamlFile<RepoList>('repos.yml');
    console.table(repos.repos.map((r) => ({ id: r.id, repo: r.repo, owner: r.owner, stage: r.stage, status: r.status })));
  });

program
  .command('repos:show <id>')
  .description('Show repo by id')
  .action((id: string) => {
    const repos = loadYamlFile<RepoList>('repos.yml');
    const r = repos.repos.find((x) => x.id === id);
    if (!r) {
      console.error('Repo not found:', id);
      process.exit(2);
    }
    console.log(JSON.stringify(r, null, 2));
  });

program
  .command('actions:list')
  .description('List actions')
  .action(() => {
    const actions = loadYamlFile<ActionsFile>('actions.yml');
    console.table(actions.actions.map((a) => ({ id: a.id, name: a.name, path: a.http.path, method: a.http.method })));
  });

program
  .command('actions:show <id>')
  .description('Show action by id')
  .action((id: string) => {
    const actions = loadYamlFile<ActionsFile>('actions.yml');
    const a = actions.actions.find((x) => x.id === id);
    if (!a) {
      console.error('Action not found:', id);
      process.exit(2);
    }
    console.log(JSON.stringify(a, null, 2));
  });

program
  .command('capabilities:list')
  .description('List capabilities')
  .action(() => {
    const actions = loadYamlFile<ActionsFile>('actions.yml');
    console.table(actions.capabilities.map((c) => ({ id: c.id, name: c.name })));
  });

program
  .command('generate-openapi')
  .description('Generate OpenAPI 3.1 JSON for actions')
  .option('-o, --out <path>', 'output path', 'generated/openapi-actions.json')
  .action((opts) => {
    const actions = loadYamlFile<ActionsFile>('actions.yml');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const openapi: any = {
      openapi: '3.1.0',
      info: { title: 'Infinity X Actions', version: '0.1.0' },
      paths: {}
    };

    actions.actions.forEach((a) => {
      openapi.paths[a.http.path] = openapi.paths[a.http.path] || {};
      openapi.paths[a.http.path][a.http.method.toLowerCase()] = {
        summary: a.name,
        description: a.description,
        responses: {
          '200': { description: 'Success' }
        }
      };
      // If schema references exist, include basic ref stub
      if (a.request_schema) {
        openapi.paths[a.http.path][a.http.method.toLowerCase()].requestBody = {
          content: {
            'application/json': {
              schema: { $ref: `#/components/schemas/${a.request_schema}` }
            }
          }
        };
      }
    });

    const outPath = path.resolve(process.cwd(), opts.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(openapi, null, 2));
    console.log('Wrote OpenAPI to', opts.out);
  });

program.parse(process.argv);
