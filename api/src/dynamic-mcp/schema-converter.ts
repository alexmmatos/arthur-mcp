import type { JsonSchema } from './types';

export function convertToJsonSchema(oasSchema: Record<string, unknown>): JsonSchema {
  if (!oasSchema || typeof oasSchema !== 'object') return { type: 'string' };

  const schema: JsonSchema = {};

  if (oasSchema.type) schema.type = String(oasSchema.type);
  if (oasSchema.description) schema.description = String(oasSchema.description);
  if (oasSchema.format) schema.format = String(oasSchema.format);
  if (oasSchema.default !== undefined) schema.default = oasSchema.default;
  if (Array.isArray(oasSchema.enum)) schema.enum = oasSchema.enum;

  if (oasSchema.properties && typeof oasSchema.properties === 'object') {
    schema.type = 'object';
    schema.properties = {};
    for (const [key, value] of Object.entries(oasSchema.properties)) {
      if (value && typeof value === 'object') {
        schema.properties[key] = convertToJsonSchema(value as Record<string, unknown>);
      }
    }
  }

  if (Array.isArray(oasSchema.required)) {
    schema.required = oasSchema.required.filter((r): r is string => typeof r === 'string');
  }

  if (oasSchema.items && typeof oasSchema.items === 'object') {
    schema.type = 'array';
    schema.items = convertToJsonSchema(oasSchema.items as Record<string, unknown>);
  }

  if (Array.isArray(oasSchema.allOf)) {
    return mergeAllOf(oasSchema.allOf as Record<string, unknown>[]);
  }

  if (Array.isArray(oasSchema.oneOf) && oasSchema.oneOf.length > 0) {
    const first = oasSchema.oneOf[0];
    if (first && typeof first === 'object') return convertToJsonSchema(first as Record<string, unknown>);
  }

  if (Array.isArray(oasSchema.anyOf) && oasSchema.anyOf.length > 0) {
    const first = oasSchema.anyOf[0];
    if (first && typeof first === 'object') return convertToJsonSchema(first as Record<string, unknown>);
  }

  if (!schema.type && !schema.properties && !schema.items) schema.type = 'string';

  return schema;
}

function mergeAllOf(schemas: Record<string, unknown>[]): JsonSchema {
  const merged: JsonSchema = { type: 'object', properties: {}, required: [] };
  for (const sub of schemas) {
    const converted = convertToJsonSchema(sub);
    if (converted.properties) Object.assign(merged.properties!, converted.properties);
    if (converted.required) (merged.required as string[]).push(...converted.required);
    if (converted.description && !merged.description) merged.description = converted.description;
  }
  if ((merged.required as string[]).length === 0) delete merged.required;
  return merged;
}
