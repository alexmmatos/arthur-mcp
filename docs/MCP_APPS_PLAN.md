# MCP Apps Implementation Plan

## Status

In progress on branch `feat/mcp-apps`.

- Phase 0 is complete: product scope, protocol requirements, domain boundary, permissions, and delivery sequence are defined.
- Phase 1 has started: the backend entity, repository, migration, CRUD surface, generated view runtime, and MCP runtime integration are being implemented.
- No phase is considered delivered until its tests, permission coverage, documentation, and cross-driver migration checks pass.

## Decision

Add MCP Apps as a first-class Arthur domain without turning each App into a duplicate MCP server.

An App belongs to one existing data source and one enabled Tool from that source:

```text
Data source / MCP server
    -> Tool
        -> MCP App
            -> UI resource (ui://...)
            -> structured tool result
            -> interactive view in a compatible host
```

The data source remains responsible for connection configuration, upstream authentication, secrets, execution, rate limits, tenant parameters, OAuth, Access Keys, logging, and observability. The App owns only the interactive presentation attached to the Tool.

This boundary avoids duplicating credentials or execution definitions and lets an existing Tool continue to work as a regular text/JSON tool in clients that do not support MCP Apps.

## Product goal

Let an authorized user create an interactive MCP App from an existing Arthur data source without writing code. The user selects a source, selects one of its Tools, chooses a presentation, configures how the result maps to that presentation, reviews the result, and publishes it through the source's existing MCP Connection URL.

Primary user story:

> As an AI integration developer, I want to turn an existing data-source Tool into an interactive App so that users can explore its results directly inside a compatible AI conversation.

## Terminology

- **Data source:** the existing Arthur Server/MCP server that owns connection and execution behavior.
- **Tool:** the existing callable MCP operation whose result feeds the App.
- **App:** the persisted Arthur configuration associating a Tool with an interactive View.
- **View:** the generated self-contained HTML interface returned as an MCP UI resource.
- **Host:** the MCP client that renders Apps, such as a client implementing the MCP Apps extension.

Use `Apps` for the global navigation label, `/apps` for frontend routes, `mcp-apps` for backend REST routes, `McpApp` for TypeScript domain types, `mcp_apps` for the database table, and `ui://arthur/apps/<id>/view.html` for generated resources.

## MVP scope

### Included

- Global `Apps` menu immediately below `Servers`.
- Apps list with search, source/tool identity, presentation type, active state, edit, and delete actions.
- Dedicated `/apps/new` stepper modeled after the existing primary entity creation flows.
- Data-source selection using safe App-specific source summaries.
- Tool selection from enabled Tools on the selected source.
- Four generated presentation types:
  - Table
  - Cards
  - Details
  - JSON
- Mapping configuration:
  - optional result data path;
  - optional table columns;
  - optional card title and subtitle fields;
  - optional empty-state message.
- Review and create step.
- `/apps/:id` detail/settings page.
- App activation/deactivation.
- MCP tool metadata using `_meta.ui.resourceUri` and compatibility metadata where needed.
- Self-contained `ui://` resource with MIME type `text/html;profile=mcp-app`.
- `structuredContent` for App-backed Tool results plus meaningful text fallback.
- Generated View handshake, tool-result rendering, host theme adaptation, resize notifications, and refresh through `tools/call`.
- CRUD permissions, built-in role presets, custom role UI, backend guards, and frontend gates.
- TypeORM migration compatible with SQLite, PostgreSQL, and MySQL.
- Backend and frontend tests plus flow/entity/design documentation.

### Deferred

- Arbitrary user-authored JavaScript, React, CSS, or uploaded HTML.
- Importing a complete Skybridge project.
- A hosted visual drag-and-drop builder.
- Multiple Apps attached to the same Tool.
- App-only Tools and cross-Tool workflow composition from the View.
- App version history, drafts, approvals, rollback, cloning, and templates.
- Marketplace/store submission automation.
- Media permissions such as camera, microphone, and geolocation.
- External resource domains, custom CSP editing, and dedicated sandbox domains.
- Screenshot generation and pixel-accurate host emulation.

These items remain outside the MVP because they introduce executable user content, a larger sandbox/security boundary, or additional lifecycle concepts. The persisted View configuration is intentionally declarative so the first release can be reviewed and rendered safely.

## Routes and navigation

Frontend routes:

| Route | Purpose | Permission |
|---|---|---|
| `/apps` | Browse Apps | `apps_view` |
| `/apps/new` | Create an App | `apps_create` |
| `/apps/:id` | View or edit an App | `apps_view`; mutations use `apps_edit` |

Backend routes:

| Method and route | Purpose | Permission |
|---|---|---|
| `GET /api/mcp-apps` | List Apps | `apps_view` |
| `GET /api/mcp-apps/sources` | List safe source and Tool summaries for creation | `apps_create` |
| `GET /api/mcp-apps/:id` | Read App details | `apps_view` |
| `POST /api/mcp-apps` | Create an App | `apps_create` |
| `PATCH /api/mcp-apps/:id` | Edit configuration or active state | `apps_edit` |
| `DELETE /api/mcp-apps/:id` | Delete an App | `apps_delete` |

The source-selection endpoint is owned by the Apps domain and returns only source identity, tags, Tool descriptions, and input/output schemas. It does not expose source credentials, raw specifications, secrets, upstream authentication, or connection configuration.

## Creation flow

Entry point: `Apps` -> `New App`.

### Step 1 — Data source

- Load sources through `GET /api/mcp-apps/sources`.
- Show source name, description, source type, and available Tool count.
- Disable sources without enabled Tools and explain why.
- Single-click selects; double-click may select and continue.
- Empty state links to `/servers/new` when the user also has `servers_create`.

### Step 2 — Tool

- Show enabled Tools from the selected source.
- Display Tool name, description, input fields, and whether an output schema is available.
- Explain that the App does not copy or change Tool execution.
- Prevent selection of a Tool that already has an App.

### Step 3 — View

- Capture App name and optional description.
- Choose Table, Cards, Details, or JSON.
- Configure result data path and view-specific mappings.
- Keep the App active by default.
- Provide a deterministic illustrative preview; clearly label it as a structural preview rather than live source data.

### Step 4 — Review

- Show source, Tool, View type, mappings, active state, and compatibility behavior.
- State that the existing source Connection URL remains the URL configured in the MCP client.
- Create the App and navigate to `/apps/:id`.
- Preserve form state on recoverable API errors.

## Detail flow

The App detail page must provide:

- App identity and active status.
- Linked data source and Tool.
- Generated `ui://` resource URI.
- Existing MCP Connection URL derived from the source share slug or ID.
- Editable presentation and mapping settings for users with `apps_edit`.
- A direct link back to the source.
- Clear compatibility guidance: compatible hosts render the View; other hosts receive the Tool's normal fallback result.
- Delete confirmation for users with `apps_delete`.

Changing an App invalidates the source's dynamic MCP cache immediately. Deleting the source deletes its Apps through a database cascade.

## Persistence model

Table: `mcp_apps`.

| Field | Type | Rules |
|---|---|---|
| `id` | UUID | Primary key |
| `name` | string | Required, trimmed |
| `description` | string | Optional |
| `server_id` | UUID | Required; references `swagger_projects.id`; cascade delete |
| `tool_name` | string | Required; must identify an enabled Tool on the source |
| `view_type` | string | `table`, `cards`, `details`, or `json` |
| `view_config` | JSON/text | Declarative mappings only |
| `is_active` | boolean | Defaults to `true` |
| `created_at` | timestamp | Generated |
| `updated_at` | timestamp | Generated |

Constraints:

- Unique `(server_id, tool_name)` in the MVP.
- Index `server_id` for runtime lookup.
- No credentials, tokens, secrets, executable JavaScript, or copied Tool definitions are persisted in an App.
- Schema changes are delivered only through a new migration; existing migrations remain frozen.

## Permission model

New permission keys:

| Permission | Capability |
|---|---|
| `apps_view` | See the menu, list, App details, linked source/Tool identity, and generated resource URI |
| `apps_create` | Read safe creation source summaries and create Apps |
| `apps_edit` | Change identity, mapping, View type, linked source/Tool, and active state |
| `apps_delete` | Permanently delete Apps |

Built-in role defaults:

| Role | View | Create | Edit | Delete |
|---|---:|---:|---:|---:|
| Admin | yes | yes | yes | yes |
| Developer | yes | yes | yes | yes |
| Editor | yes | yes | yes | no |
| Viewer | yes | no | no | no |

Every permission must be added to:

- backend `RolePermissions`;
- backend all-off and built-in presets;
- backend `PermissionsGuard` fallback map;
- frontend `Permission` enum;
- frontend `UserPermissions`;
- frontend all-off and role fallback presets;
- Profile role permission groups and locale labels;
- route navigation and action visibility;
- service/controller and frontend tests;
- `docs/ENTITIES.md`, `docs/FLOWS.md`, and this plan.

Backend guards remain authoritative. Frontend gates exist for navigation clarity and restricted states only.

## MCP protocol behavior

For each active App on a source:

1. `tools/list` keeps the original Tool contract and adds:

```json
{
  "_meta": {
    "ui": {
      "resourceUri": "ui://arthur/apps/<app-id>/view.html",
      "visibility": ["model", "app"]
    }
  }
}
```

2. The referenced resource is readable through `resources/read` with:

```text
text/html;profile=mcp-app
```

3. Tool execution preserves the normal `content` fallback and adds `structuredContent` when the result can be represented as JSON.

4. Array results are wrapped for the structured contract when necessary; object results remain objects; scalar results use a named value field.

5. Clients without MCP Apps support continue to see the Tool and its text/JSON result without a broken or empty response.

6. Inactive Apps publish no UI metadata or UI resource.

Generated Views are self-contained and use text-only DOM assignment for source data. They must not inject source values through raw HTML. The first release requests no camera, microphone, geolocation, external network, or custom iframe permissions.

## Architecture

Backend ownership:

```text
McpAppsModule
├── McpAppsController       HTTP and permission boundary
├── McpAppsService          validation, source/Tool relationship, cache invalidation
├── IMcpAppRepository       persistence contract
├── TypeOrmMcpAppRepository persistence implementation
├── McpAppEntity            TypeORM entity
└── renderMcpAppView        pure HTML generation

DynamicMcpService
├── loads active Apps with cached source data
├── decorates tools/list
├── enriches tools/call results
└── serves ui:// resources
```

Frontend ownership:

```text
src/features/apps/
├── App cards and domain UI
├── typed contracts
└── mapping/preview helpers when needed

src/pages/Apps/       list orchestration
src/pages/NewApp/     creation stepper
src/pages/AppDetail/  detail and settings orchestration
```

Pages remain route orchestrators. App-specific components and contracts belong to `src/features/apps/`. Shared components are used only when already domain-neutral.

## Delivery phases

- [x] **Phase 0 — product and architecture:** confirm the domain boundary, declarative MVP, source/Tool relationship, protocol contract, permissions, routes, risks, and non-goals.
- [ ] **Phase 1 — persistence and CRUD:** add entity, repository contract/implementation, cross-driver migration, service validation, controller routes, module wiring, permissions, and focused backend tests.
- [ ] **Phase 2 — MCP runtime:** load active Apps into dynamic server creation, decorate Tool metadata, serve self-contained UI resources, add structured results and fallback behavior, invalidate cache on mutations, and add protocol-focused tests.
- [ ] **Phase 3 — frontend foundation:** add Apps feature contracts/components, i18n namespace, menu entry below Servers, lazy routes, permission gates, list states, search, deletion, and frontend tests.
- [ ] **Phase 4 — creation wizard:** implement source, Tool, View, and review steps with validation, responsive behavior, empty/error/loading states, create navigation, and focused tests.
- [ ] **Phase 5 — App detail:** implement read/edit/activate/delete behavior, linked source navigation, resource/connection information, compatibility guidance, and focused tests.
- [ ] **Phase 6 — documentation and validation:** update entities, design patterns, flows, handoff, roadmap, permission documentation, run all frontend/backend tests and builds, and manually validate against an MCP Apps-capable host.

## Acceptance criteria

### Product

- `Apps` appears immediately below `Servers` only for users with `apps_view`.
- An authorized user can complete the source -> Tool -> View -> review flow and land on the created App detail page.
- A user cannot attach two Apps to the same Tool in the MVP.
- Source and Tool deletion/change errors are actionable and do not silently create broken Apps.
- Loading, empty, no-result, forbidden, save-error, and delete-confirmation states exist.

### Permissions

- Every REST mutation is guarded by its matching App permission.
- Navigation and frontend actions use the same permission keys.
- Built-in and custom roles expose the new permission group consistently.
- A viewer can read but cannot create, edit, activate, or delete.
- An editor can create and edit but cannot delete by default.

### Protocol

- An active App adds `_meta.ui.resourceUri` to exactly its linked Tool.
- `resources/read` returns the referenced self-contained HTML with the official MCP App MIME type.
- App-backed Tool calls include useful `structuredContent` and meaningful fallback `content`.
- An inactive or deleted App no longer appears in MCP metadata after cache invalidation.
- The generated View completes the MCP Apps initialization handshake and renders Table, Cards, Details, and JSON mappings.
- Source values are inserted with safe DOM text APIs, not raw HTML interpolation.

### Persistence

- Migration up/down tests pass on SQLite and use portable TypeORM definitions for PostgreSQL/MySQL.
- Deleting a source cascades to its Apps.
- Updating or deleting an App invalidates the correct source cache.
- No credential or executable user code is stored in `mcp_apps`.

### Quality

- Backend focused tests cover service validation, duplicate prevention, cache invalidation, generated resource safety, and protocol mapping.
- Frontend focused tests cover list permissions, wizard validation, successful creation, edit, and deletion.
- `npm run type-check`, `npm test`, `npm run build --prefix api`, relevant backend Jest suites, locale JSON/parity checks, and `git diff --check` pass.
- A manual test with the official basic host or another compatible host confirms rendering and refresh behavior before the feature is considered production-ready.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| MCP Apps extension changes while still evolving | Keep protocol metadata and generated runtime isolated behind focused helpers and tests |
| Existing SDK types lag the extension | Use standards-shaped metadata at the low-level server boundary and test actual JSON-RPC output |
| Arbitrary source response shapes | Provide data-path and field mapping plus JSON fallback |
| Tool output is not valid JSON | Preserve text fallback and wrap scalar text for JSON/Details rendering |
| XSS from upstream data | Use `textContent`/DOM nodes only; never inject result values as HTML |
| Stale dynamic MCP cache | Invalidate the source cache after every create/update/delete operation |
| Source removed while an App exists | Database cascade delete plus service-level source validation |
| Client does not support MCP Apps | Preserve normal Tool metadata/result behavior and meaningful text content |
| Custom roles miss new permission fields | Merge against all-off defaults and show the Apps group in role management |

## Completion rule

The feature is complete only when the entire flow works through the existing source Connection URL in a compatible MCP host. A menu, CRUD page, generated preview, or stored App record without protocol publication does not satisfy the goal.
