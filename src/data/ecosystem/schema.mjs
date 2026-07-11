const TYPES = new Set(['repository', 'workshop', 'application', 'guide']);
const LAYERS = new Set(['build', 'learn', 'apply']);
const ECOSYSTEMS = new Set(['kotlin', 'go', 'rust', 'python']);

export function validateCatalog(catalog) {
  const errors = [];
  if (!catalog || !Array.isArray(catalog.nodes)) return ['catalog.nodes must be an array'];

  const ids = new Map();
  for (const [index, node] of catalog.nodes.entries()) {
    const prefix = node?.id || `nodes[${index}]`;
    if (!node || typeof node !== 'object') {
      errors.push(`nodes[${index}] must be an object`);
      continue;
    }
    if (!nonEmpty(node.id)) errors.push(`nodes[${index}]: id is required`);
    if (ids.has(node.id)) errors.push(`${prefix}: duplicate id`);
    else ids.set(node.id, node);
    if (!TYPES.has(node.type)) errors.push(`${prefix}: invalid type ${String(node.type)}`);
    if (!LAYERS.has(node.layer)) errors.push(`${prefix}: invalid layer ${String(node.layer)}`);
    if (!ECOSYSTEMS.has(node.ecosystem)) errors.push(`${prefix}: invalid ecosystem ${String(node.ecosystem)}`);
    if (node.layer === 'apply' && node.ecosystem !== 'kotlin') {
      errors.push(`${prefix}: only Kotlin nodes may use apply`);
    }
    if (!nonEmpty(node.group)) errors.push(`${prefix}: group is required`);
    for (const locale of ['en', 'ko']) {
      if (!nonEmpty(node.label?.[locale])) errors.push(`${prefix}: label.${locale} is required`);
      if (!nonEmpty(node.description?.[locale])) errors.push(`${prefix}: description.${locale} is required`);
    }
    if (!validDestination(node.route, node.url)) errors.push(`${prefix}: valid route or URL is required`);
    if (!Array.isArray(node.relations)) errors.push(`${prefix}: relations must be an array`);
  }

  for (const node of catalog.nodes.filter((candidate) => candidate && Array.isArray(candidate.relations))) {
    for (const targetId of node.relations) {
      const target = ids.get(targetId);
      if (!target) errors.push(`${node.id}: missing relation target ${targetId}`);
      else if (target.ecosystem !== node.ecosystem) {
        errors.push(`${node.id}: cross-ecosystem relation ${targetId}`);
      }
      else if (!Array.isArray(target.relations) || !target.relations.includes(node.id)) {
        errors.push(`${node.id}: relation ${targetId} is not reciprocal`);
      }
    }
  }

  return errors.sort();
}

function nonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validDestination(route, url) {
  const validRoute = nonEmpty(route) && route.startsWith('/') && !route.startsWith('//');
  let validUrl = false;
  if (nonEmpty(url)) {
    try {
      validUrl = ['https:', 'http:'].includes(new URL(url).protocol);
    } catch {
      validUrl = false;
    }
  }
  return validRoute || validUrl;
}
