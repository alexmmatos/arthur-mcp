# Flows

This document records user-facing workflows that are important for agents to preserve. Update it whenever a change affects user journeys, permission-sensitive UI behavior, loading/error states, or API behavior visible to users.

## Secrets Vault

Goal: let authorized users manage named secret references without exposing sensitive values unnecessarily.

Entry points:

- `/secrets`
- `/secrets/:id`
- `SecretAutocomplete` in server/template configuration flows

Permissions:

- `secrets_view_names`: can list and read secret metadata.
- `secrets_reveal_values`: can reveal/copy secret values through the dedicated value endpoint.
- `secrets_create`: can create secrets.
- `secrets_edit`: can update metadata and values.
- `secrets_delete`: can delete secrets.

Backend behavior:

- `GET /api/secrets` returns metadata only.
- `GET /api/secrets/:id` returns metadata only.
- `GET /api/secrets/:id/value` returns `{ value }` and requires `secrets_reveal_values`.
- `POST /api/secrets` and `PATCH /api/secrets/:id` return metadata only.

Frontend behavior:

- The list page displays masked values by default.
- Reveal/copy actions request the value lazily from `/api/secrets/:id/value`.
- Users without reveal permission can still see names/descriptions when they have `secrets_view_names`, but cannot retrieve values.
- Secret references use `{{secret:NAME}}` and do not require exposing the underlying value.

Risk to preserve:

- Do not reintroduce secret values into list/detail metadata responses.
- Do not rely on frontend checks alone; backend permission guards are authoritative.

## Language and Terminology

Goal: let users view the app in a supported language and customize core MCP domain labels without changing code.

Entry points:

- Global language control in the app shell.
- `/settings` terminology section.

Backend behavior:

- `GET /api/settings` returns optional terminology override fields: `termServer`, `termTool`, `termResource`, `termPrompt`, `termChain`, and `termSecret`.
- Settings persistence stores the same fields in both SQLite and MongoDB models.
- `PATCH /api/settings` accepts `null` or empty-equivalent terminology values to return that term to the locale default.

Frontend behavior:

- `src/i18n.ts` initializes i18next with `en` and `pt-BR` resources.
- Language detection checks `localStorage.lang` first, then the browser navigator language, and falls back to English.
- Translation resources are grouped by namespace under `src/locales/<locale>/`.
- `TerminologyProvider` loads saved terminology after a token is present.
- `useTerm()` returns a saved terminology override when present, otherwise the active locale default from `common.terms`.
- Saving terminology in Settings reloads the terminology context so labels can update without a full page reload.

Risk to preserve:

- Do not hardcode new user-facing strings on pages that already use i18n.
- Keep translation keys in English even when locale values are translated.
- Keep configurable terms limited to domain labels; do not use terminology overrides for complete sentences.

## REST Server Templates

Goal: let users create a preconfigured REST server from a template while preserving source-type filtering and source-specific behavior.

Entry points:

- `/templates`

Backend behavior:

- `POST /api/swagger/servers` accepts optional `tags` when creating an empty server.
- Template-created servers must include `source:rest` in `tags`.
- Source-aware backend logic reads the first `source:<type>` tag and falls back to `rest` when no source tag is present.

Frontend behavior:

- `src/data/api-templates.ts` exports `SERVER_TEMPLATE_SOURCE_TAG` as `source:rest`.
- `src/pages/Templates.tsx` sends `tags: [SERVER_TEMPLATE_SOURCE_TAG]` when creating a server from any API template.
- Tools from the template are added after the tagged server is created.

Risk to preserve:

- Do not create API-template servers without `source:rest`; they should appear and behave as REST API servers immediately.
- Do not use non-REST source tags for entries in `API_TEMPLATES`.

## Page-Based Entity Creation

Goal: make primary creation flows feel consistent with server creation instead of mixing modals, drawers, and pages for similar tasks.

Entry points:

- `/servers/new`
- `/prompts/new`
- `/secrets/new`

Frontend behavior:

- List pages remain browse/manage surfaces.
- Primary create buttons navigate to a dedicated `new` route.
- New entity pages use a stepper and a final review step.
- Server source cards support single-click to select and double-click to select and continue to the Details step.
- Prompt creation uses Details, Content, and Review steps, then navigates to `/prompts/:id`.
- Secret creation uses Details, Value, and Review steps, then navigates to `/secrets/:id`.
- Server creation remains the most complex flow and continues to use source-specific steps.

Risk to preserve:

- Do not reintroduce modal/drawer creation for primary entities when a dedicated `new` route exists.
- Keep sensitive secret values masked in review and out of metadata responses.
- Keep creation routes permission-gated with the same permissions used by the list actions.

## Data Source Operations

Goal: make data-source backed servers feel operation-first instead of query-specific.

Entry points:

- `/servers/:id`, for database, NoSQL, and other source-backed servers.

Frontend behavior:

- The server-detail navigation shows `Operations` for data-source backed servers.
- The Operations tab is the place to create source operations before exposing them as MCP tools.
- Tool creation refers to selecting an operation, not selecting a query.
- Source-specific editors may still use precise labels such as `SQL Query`, Mongo operation type, Redis command, GraphQL operation, or gRPC method.
- Operations carry an input schema derived from their input parameters and may define an output schema before being exposed through MCP.
- Operation input parameters behave like GET query parameters: callers provide values, and the operation can use them as variables in the source-specific execution definition.
- In the operation editor, input parameters appear before the source-specific query, command, document, or request body so users define the contract before the execution logic.
- Tool creation copies the selected operation's input/output schemas when available.

Compatibility note:

- Backend routes and storage may still use `queries` and `DbQuery` until the operation-first backend migration is complete.
