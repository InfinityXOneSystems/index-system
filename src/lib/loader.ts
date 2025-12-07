import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
addFormats(ajv);

// Preload capabilities schema for $ref use in actions.action.json
try {
  const capabilitiesSchemaPath = path.resolve(process.cwd(), 'schemas/capabilities.capability.json');
  if (fs.existsSync(capabilitiesSchemaPath)) {
    const capabilitiesSchema = JSON.parse(fs.readFileSync(capabilitiesSchemaPath, 'utf8'));
    ajv.addSchema(capabilitiesSchema, 'capabilities.capability.json');
  }
} catch {
  // safe to ignore at startup; validation will still report proper errors if schema is missing
}

export function loadYamlFile<T>(relPath: string): T {
  const p = path.resolve(process.cwd(), relPath);
  if (!fs.existsSync(p)) {
    throw new Error(`File not found: ${relPath}`);
  }
  const content = fs.readFileSync(p, 'utf8');
  return yaml.load(content) as T;
}

export function loadJsonFile<T>(relPath: string): T {
  const p = path.resolve(process.cwd(), relPath);
  if (!fs.existsSync(p)) {
    throw new Error(`File not found: ${relPath}`);
  }
  const content = fs.readFileSync(p, 'utf8');
  return JSON.parse(content) as T;
}

export function validateSchema(instance: unknown, schemaPath: string): { valid: boolean; errors?: unknown } {
  const p = path.resolve(process.cwd(), schemaPath);
  const schema = JSON.parse(fs.readFileSync(p, 'utf8'));
  const validate = ajv.compile(schema);
  const valid = validate(instance) as boolean;
  return { valid, errors: validate.errors };
}
