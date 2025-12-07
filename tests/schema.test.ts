import { loadYamlFile, validateSchema } from '../src/lib/loader';

test('repos.yml validates against schema', () => {
  const repos = loadYamlFile('repos.yml');
  const result = validateSchema(repos, 'schemas/repos.repo.json');
  expect(result.valid).toBe(true);
});

test('actions.yml validates against schema', () => {
  const actions = loadYamlFile('actions.yml');
  const result = validateSchema(actions, 'schemas/actions.action.json');
  expect(result.valid).toBe(true);
});
