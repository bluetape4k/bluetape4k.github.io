import path from 'node:path';

const DOCUMENT_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MODES = new Set(['history', 'simulation', 'hybrid']);
const VIEWS = new Set(['history', 'simulation']);

export class VisualCompanionManifestError extends Error {
  constructor(code, actual) {
    super(`${code}: ${String(actual)}`);
    this.name = 'VisualCompanionManifestError';
    this.code = code;
    this.actual = actual;
  }
}

function fail(code, actual) {
  throw new VisualCompanionManifestError(code, actual);
}

export function safeSourcePath(value) {
  if (
    typeof value !== 'string'
    || value === ''
    || value.trim() !== value
    || value.includes('\\')
    || value.includes('\0')
    || path.posix.isAbsolute(value)
    || /^[a-z][a-z\d+.-]*:/i.test(value)
    || value.split('/').some((segment) => segment === '' || segment === '.' || segment === '..')
    || path.posix.normalize(value) !== value
  ) {
    fail('VISUAL_SOURCE_PATH', value);
  }
  return value;
}

function requiredText(value, code) {
  if (typeof value !== 'string' || value === '' || value.trim() !== value) fail(code, value);
  return value;
}

function presentation(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail('VISUAL_PRESENTATION', value);
  }
  const mode = requiredText(value.mode, 'VISUAL_PRESENTATION_MODE');
  if (!MODES.has(mode)) fail('VISUAL_PRESENTATION_MODE', mode);
  const defaultView = requiredText(value.defaultView, 'VISUAL_DEFAULT_VIEW');
  if (!VIEWS.has(defaultView)) fail('VISUAL_DEFAULT_VIEW', defaultView);
  if (!Array.isArray(value.views) || value.views.length === 0) {
    fail('VISUAL_PRESENTATION_VIEWS', value.views);
  }
  const views = value.views.map((view) => {
    if (!VIEWS.has(view)) fail('VISUAL_PRESENTATION_VIEWS', view);
    return view;
  });
  if (new Set(views).size !== views.length || !views.includes(defaultView)) {
    fail('VISUAL_PRESENTATION_VIEWS', views.join(','));
  }
  if (
    (mode === 'history' && (views.length !== 1 || views[0] !== 'history'))
    || (mode === 'simulation' && (views.length !== 1 || views[0] !== 'simulation'))
    || (mode === 'hybrid' && (views.length !== 2 || !views.includes('history') || !views.includes('simulation')))
  ) {
    fail('VISUAL_PRESENTATION_VIEWS', `${mode}:${views.join(',')}`);
  }
  return { mode, defaultView, views };
}

function locale(value, expectedLocale) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail('VISUAL_LOCALE', expectedLocale);
  }
  const html = safeSourcePath(value.html);
  if (!html.endsWith('.html')) fail('VISUAL_LOCALE_HTML', html);
  return {
    title: requiredText(value.title, 'VISUAL_LOCALE_TITLE'),
    html,
  };
}

function publicDocument(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail('VISUAL_DOCUMENT', value);
  }
  const id = requiredText(value.id, 'VISUAL_DOCUMENT_ID');
  if (!DOCUMENT_ID.test(id)) fail('VISUAL_DOCUMENT_ID', id);
  if (value.status !== 'approved') fail('VISUAL_DOCUMENT_STATUS', value.status);
  if (!value.locales || typeof value.locales !== 'object' || Array.isArray(value.locales)) {
    fail('VISUAL_DOCUMENT_LOCALES', value.locales);
  }
  return {
    id,
    source: safeSourcePath(value.source),
    status: 'approved',
    presentation: presentation(value.presentation),
    locales: {
      en: locale(value.locales.en, 'en'),
      ko: locale(value.locales.ko, 'ko'),
    },
  };
}

export function projectPublicVisualCompanionManifest(value, expectedRepository) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail('VISUAL_MANIFEST', value);
  }
  if (value.schemaVersion !== 1) fail('VISUAL_MANIFEST_SCHEMA', value.schemaVersion);
  if (value.repository !== expectedRepository) {
    fail('VISUAL_MANIFEST_REPOSITORY', value.repository);
  }
  if (!Array.isArray(value.documents)) fail('VISUAL_MANIFEST_DOCUMENTS', value.documents);

  const ids = new Set();
  const documents = value.documents.filter(({ public: isPublic }) => isPublic === true).map((candidate) => {
    const document = publicDocument(candidate);
    if (ids.has(document.id)) fail('VISUAL_DOCUMENT_DUPLICATE', document.id);
    ids.add(document.id);
    return document;
  });
  if (documents.length === 0) fail('VISUAL_MANIFEST_DOCUMENTS', documents.length);

  return { schemaVersion: 1, repository: expectedRepository, documents };
}
