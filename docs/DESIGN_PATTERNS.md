# Design Patterns

This document records the backend and frontend design patterns currently used in the project. Keep it in sync whenever implementation style, architecture, state management, data access, routing, validation, UI composition, or cross-cutting behavior changes.

## Backend Patterns

The backend is a NestJS application organized around domain modules, repository contracts, and cross-cutting providers.

### Modular Architecture

Pattern: NestJS module per domain.

Examples:

- `api/src/users/users.module.ts`
- `api/src/auth/auth.module.ts`
- `api/src/swagger/swagger.module.ts`
- `api/src/dynamic-mcp/dynamic-mcp.module.ts`

Rules:

- Keep controllers, services, repositories, entities, and schemas close to their domain.
- Export services only when another module needs them.
- Prefer importing another module over reaching across folders for implementation details.
- Register cross-cutting providers at the app level only when they truly apply globally.

### Controller-Service Separation

Pattern: controllers handle HTTP concerns; services own business behavior.

Examples:

- `UsersController` handles route decorators, request data, response status, and audit logging calls.
- `UsersService` owns password hashing, uniqueness checks, user updates, and not-found behavior.

Rules:

- Controllers should stay thin and delegate business decisions to services.
- Services should not depend on Express request/response objects.
- Throw Nest exceptions from services when the failure belongs to business/domain behavior.
- Keep DTO-like request shapes explicit, even when they are inline types.
- Prefer named DTO classes under `dto/` for mutation-heavy controllers so request shapes stay searchable and reusable.

### Repository Contract

Pattern: services depend on repository interfaces injected by tokens, not directly on TypeORM repositories or Mongoose models.

Examples:

- Tokens: `api/src/database/database.tokens.ts`
- Contracts: `api/src/users/user.repository.ts`, `api/src/swagger/swagger-project.repository.ts`
- Implementations: `repositories/mongo-*.repository.ts` and `repositories/sqlite-*.repository.ts`

Rules:

- Add or change fields in this order: entity/schema, repository contract, Mongo repository, SQLite repository, service usage, docs.
- Keep repository return records stable across persistence backends.
- Map SQLite `id` and Mongo `_id` consistently at repository boundaries.
- Keep JSON serialization/deserialization inside repository implementations, not services.
- Use separate read models for security-sensitive records when different use cases need different field visibility. For example, `SecretRecord` includes `value` for internal resolution, while API-facing list/read flows return metadata without `value`.
- Preserve server source tags as regular `tags` entries using the `source:<type>` format.

### Dual Persistence Strategy

Pattern: `DatabaseModule.forRoot()` selects MongoDB or SQLite based on `DATABASE`.

Examples:

- MongoDB path uses `MongooseModule.forRootAsync()` and `MongooseModule.forFeature()`.
- SQLite path uses `TypeOrmModule.forRoot()` and `TypeOrmModule.forFeature()`.

Rules:

- Any domain entity must support both persistence paths unless the feature is intentionally backend-specific.
- Keep TypeORM entities and Mongoose schemas semantically aligned.
- Document differences in `docs/ENTITIES.md`.
- Avoid leaking database-specific types outside repositories.

### Guard and Decorator Authorization

Pattern: authentication and permissions are enforced through guards and metadata decorators.

Examples:

- `JwtAuthGuard`
- `PermissionsGuard`
- `RequirePermission`
- `McpApiKeyGuard`
- `ProjectStateGuard`
- `RateLimitGuard`

Rules:

- Use guards for route access decisions.
- Use decorators for declarative permission requirements.
- Keep permission names aligned with `RolePermissions` and frontend `Permission`.
- Keep built-in backend role presets in `api/src/roles/permissions.ts`.
- Keep frontend fallback presets in `src/context/permissionPresets.ts`.
- Admin bypass behavior belongs in the guard, not each controller.

### Cross-Cutting Filters and Interceptors

Pattern: global providers handle behavior that cuts across modules.

Examples:

- `McpExceptionFilter` registered through `APP_FILTER`.
- `McpLoggingInterceptor` registered through `APP_INTERCEPTOR`.
- `SpaFilter` registered in `main.ts` for React Router fallback.
- `JsonLogger` configured during bootstrap.

Rules:

- Use filters for consistent exception shaping or routing fallback.
- Use interceptors for logging, metrics, or request lifecycle behavior.
- Keep MCP-specific behavior isolated from regular REST API behavior when possible.

### Pure Functions for Protocol Transformations

Pattern: stateless transformations are implemented as pure functions outside Nest providers.

Examples:

- `openapi-parser.ts`
- `param-builder.ts`
- `request-builder.ts`
- `response-mapper.ts`
- `schema-converter.ts`
- `tool-generator.ts`

Rules:

- Prefer pure functions for parsing, mapping, generation, and request construction.
- Add focused unit tests for transformation logic.
- Keep side effects, network calls, and database access out of these files.

### Adapter Pattern for External Execution

Pattern: dynamic execution is routed to source-specific adapters.

Examples:

- `dynamic-mcp/adapters/sql.adapter.ts`
- `dynamic-mcp/adapters/mongodb.adapter.ts`
- `dynamic-mcp/adapters/redis.adapter.ts`

Rules:

- Add a new source by defining its execution reference shape, adapter, validation, and docs.
- Keep driver-specific logic inside the adapter.
- Return normalized results from adapters so MCP response logic can stay generic.
- Fail with actionable missing-driver messages.

### Facade and Feature Services

Pattern: large domain surfaces can expose a facade service while delegating focused responsibility to feature services.

Examples:

- `SwaggerService` remains the controller-facing facade for Swagger/MCP server operations.
- `SwaggerImportService` owns OpenAPI/Postman import, reimport, discovery, and upstream connection testing.
- `SwaggerApiKeysService` owns legacy and multi-key MCP API key operations.

Rules:

- Extract a feature service when a responsibility can change independently.
- Keep route compatibility in the facade while moving focused behavior behind it.
- Avoid adding new unrelated responsibilities to `SwaggerService`; prefer another focused service.

### Configuration and Bootstrap

Pattern: app-level setup lives in `main.ts` and `AppModule`.

Examples:

- `ConfigModule.forRoot({ isGlobal: true, validate: validateEnv })`
- Global `/api` prefix with explicit exclusions for health, MCP, docs, and OAuth endpoints.
- CORS controlled by `CORS_ORIGIN`.
- Static Vite build serving through Express when nginx is not in front.

Rules:

- Keep environment validation in `api/src/config/env.validation.ts`.
- Document command/setup changes in `AGENTS.md`.
- Document deployment behavior changes in the relevant infra docs or `docs/ROADMAP.md` if no dedicated doc exists yet.

### Testing Pattern

Pattern: use focused Jest tests for services, guards, filters, and pure transformation logic.

Examples:

- `auth.service.spec.ts`
- `roles.service.spec.ts`
- `permissions.guard.spec.ts`
- `request-builder.spec.ts`
- `response-mapper.spec.ts`

Rules:

- Test pure functions directly.
- Test services with mocked repository contracts.
- Add e2e tests when route wiring, guards, or module integration is the risk.
- Backend coverage is gated through `npm run test:cov --prefix api -- --runInBand`.
- The Jest coverage gate tracks service logic, dynamic MCP helper/guard logic, and other testable units. Framework wiring, decorators, entities, schemas, repository implementations, and large legacy facades are excluded from the global coverage gate until they receive dedicated test strategies.
- Keep global backend coverage at or above 80% statements, 70% branches, 80% functions, and 80% lines.

## Frontend Patterns

The frontend is a React/Vite application organized around route-level pages, shared components, small context providers, and Material UI composition.

### Route-Level Pages

Pattern: each main route maps to a page component under `src/pages/`.

Examples:

- Route table in `src/App.tsx`.
- Pages in `src/pages/Servers.tsx`, `src/pages/ServerDetail.tsx`, `src/pages/Settings.tsx`, and related files.

Rules:

- Put route orchestration, page-specific data loading, and page-local UI state in page components.
- Extract reusable widgets to `src/components/` when they are shared across pages.
- Extract cohesive route feature sections to `src/features/<route-or-domain>/` when a page grows beyond orchestration and starts owning unrelated UI, state, and API concerns.
- Keep route guards in `App.tsx` unless a more general auth/routing abstraction becomes necessary.

### Server Detail Feature Modules

Pattern: `ServerDetail` should act as the server detail route orchestrator, while cohesive server sections live under `src/features/server/`.

Examples:

- `src/features/server/settings/RateLimitPanel.tsx`
- `src/features/server/types.ts`
- `src/components/SaveIndicator.tsx`

Rules:

- Keep page-level tab selection, project loading, navigation, and cross-tab state in `src/pages/ServerDetail.tsx`.
- Move self-contained panels, dialogs, accordions, and tab bodies into `src/features/server/<area>/`.
- Share feature-local types through `src/features/server/types.ts` only when more than one server feature module needs them.
- Put cross-feature UI widgets in `src/components/` only when they are not specific to server detail.
- Preserve current behavior while extracting modules; avoid combining extraction with product changes.

### Page-Based Creation Flows

Pattern: primary entity creation uses a dedicated `new` route with a stepper, matching the server creation experience.

Examples:

- `src/pages/NewServer.tsx`
- `src/pages/NewPrompt.tsx`
- `src/pages/NewSecret.tsx`

Rules:

- Use a page route for creating primary entities that users may need to review before saving.
- Use steps for the minimum meaningful sequence: details, content/value/configuration, review.
- Keep the list page as a browsing surface; its primary create action should navigate to the `new` route.
- After successful creation, navigate to the created entity detail page when one exists.
- Use drawers only for contextual secondary flows such as applying a template or editing a small nested item without leaving the current page.
- Keep the stepper, back action, error alert, and final review visually aligned with `NewServer`.
- For selectable cards in the first step, single-click should select and double-click may select and advance when the next step is unambiguous.

### Operation-First Data Source Language

Pattern: user-facing data-source execution surfaces use "Operations" as the generic concept, while source-specific forms can still name the concrete operation type.

Examples:

- `src/pages/ServerDetail.tsx`
- `docs/INTEGRATION_MODEL.pt-BR.md`

Rules:

- Use `Operations` for the server-detail tab and generic CTAs such as add/edit/delete/select.
- Use source-specific labels inside the operation editor, such as `SQL Query`, Mongo operation type, Redis command, GraphQL operation, or gRPC method.
- Keep legacy internal names such as `DbQuery` and `/queries` endpoints during the compatibility phase.
- Do not introduce new user-facing "Queries" labels as the generic concept.
- Store an `inputSchema` and optional `outputSchema` on data-source operations so MCP Tools and Resources can inherit a stable contract.
- Derive `inputSchema` from operation input parameters. Treat these parameters like GET query parameters: MCP clients send values, and operation executors can use them as variables in SQL, JSON templates, Redis keys, GraphQL variables, or request templates.
- In operation forms, place input parameters before source-specific execution fields. The form order should be operation identity, input contract, execution definition, output contract, then testing.

### App Shell and Contextual Navigation

Pattern: `Layout` owns the main shell; `ServerNavContext` lets detail pages replace the default sidebar with contextual navigation.

Examples:

- `src/components/Layout.tsx`
- `src/context/ServerNavContext.tsx`
- `src/pages/ServerDetail.tsx`

Rules:

- Use default navigation for global app sections.
- Use contextual navigation for server-detail tabs and server-specific workflows.
- Keep navigation visibility tied to permissions through `useAuth().can`.

### Internationalization and Terminology

Pattern: user-facing copy is translated through i18next namespaces, while configurable domain terms are loaded from settings.

Examples:

- `src/i18n.ts`
- `src/locales/en/*.json`
- `src/locales/pt-BR/*.json`
- `src/context/TerminologyContext.tsx`
- `src/pages/Settings.tsx`

Rules:

- Use `useTranslation(namespace)` for page and component copy.
- Keep translation keys, TypeScript identifiers, comments, and documentation in English.
- Locale values under `src/locales/<locale>/` may use the target language.
- Register new namespaces in `src/i18n.ts` and provide values for every supported locale.
- Use `useTerm()` for the configurable MCP domain concepts: server, tool, resource, prompt, chain, and secret.
- Store terminology overrides in the global settings fields `termServer`, `termTool`, `termResource`, `termPrompt`, `termChain`, and `termSecret`.
- After settings saves terminology changes, call `useTerminology().reload()` so active screens can use the updated terms.

### Central API Client

Pattern: all HTTP calls go through the shared Axios instance.

Example:

- `src/api.ts`

Rules:

- Use the shared `api` client instead of creating page-local Axios instances.
- Let the request interceptor attach the bearer token.
- Let the response interceptor handle `401` logout/redirect behavior.
- Keep endpoint paths relative to `/api`.
- Fetch sensitive values through dedicated reveal endpoints instead of list/detail metadata endpoints.
- When creating servers from REST templates, send `tags: ['source:rest']` with the create request.

### Auth and Permission Context

Pattern: authentication state and permission checks are centralized in `AuthContext`.

Examples:

- `src/context/AuthContext.tsx`
- `Permission` enum mirrors backend permission keys.
- `can()` supports backend-provided permissions and role-based fallback.

Rules:

- Gate UI actions with `can(Permission.X)`.
- Keep frontend permission names aligned with backend `RolePermissions`.
- Keep role fallback presets in `src/context/permissionPresets.ts`.
- Do not rely on frontend permission checks as the only security layer; backend guards remain authoritative.
- When adding a permission, update backend role permissions, frontend `Permission`, docs, and affected UI.

### Local Page State

Pattern: page components use React hooks for fetch state, form state, dirty tracking, loading, and feedback.

Examples:

- `Settings` tracks loaded settings, original values, dirty state, saving state, and snackbar state.
- `Servers` tracks projects, health, filters, confirmation dialog state, and snackbar state.

Rules:

- Keep state local when only one page needs it.
- Promote state to context only when multiple unrelated components need shared access.
- Use explicit loading, error, and empty states for user-facing fetches.
- Keep async handlers small enough to show the success and failure path clearly.

### Shared Feedback Components

Pattern: common feedback UI lives in reusable components.

Examples:

- `AppSnackbar`
- `ConfirmDialog`
- `HelpButton`
- `SecretAutocomplete`

Rules:

- Use `AppSnackbar` for transient success/error messages.
- Use `ConfirmDialog` for destructive or high-impact confirmations.
- Use `HelpButton` for contextual help that explains domain behavior.
- Keep reusable components generic and page-specific copy in the caller.
- Keep reusable component copy translation-ready by accepting labels from callers or using a stable namespace.

### Material UI Composition

Pattern: interfaces are built with MUI primitives, the `sx` prop, outlined surfaces, compact density, and Tabler/MUI icons.

Examples:

- `src/theme/index.ts`
- `src/components/Layout.tsx`
- `src/pages/Servers.tsx`
- `src/pages/Settings.tsx`

Rules:

- Prefer `Paper variant="outlined"` for framed surfaces.
- Use `Box`, `Grid`, and `gap` for layout.
- Use `Tooltip` around icon-only buttons.
- Use semantic MUI colors for status, success, warning, and error.
- Keep source UI copy in locale files instead of hardcoded strings when the surrounding page already uses i18n.
- Follow the project visual direction documented by the `ui-expert` agent.

### Theme and Color Mode

Pattern: theme definitions are centralized and selected through `ColorModeProvider`.

Examples:

- `src/theme/index.ts`
- `src/theme/ColorModeContext.tsx`
- `src/main.tsx`

Rules:

- Add palette, typography, or component override changes in the theme when they are global.
- Use `useColorMode()` for mode-aware assets or component behavior.
- Store color mode in `localStorage`.
- Avoid hardcoded colors unless they are part of an existing theme convention or a narrowly scoped visual token.

### Detail Pages and Large Local Types

Pattern: complex pages define local TypeScript interfaces close to the workflow they support.

Example:

- `src/pages/ServerDetail.tsx`

Rules:

- Keep local interfaces near the page until they are reused.
- Extract shared API/domain types only when multiple pages or components need them.
- Keep frontend types aligned with backend records and `docs/ENTITIES.md`.

### Form and Validation Pattern

Pattern: forms use controlled MUI fields, local validation helpers, explicit save handlers, and loading feedback.

Examples:

- `src/pages/Settings.tsx`
- `src/pages/NewServer.tsx`
- `src/pages/Login.tsx`

Rules:

- Validate before sending requests.
- Disable or show loading indicators during saves.
- Preserve unsaved form state unless the user explicitly discards it.
- Normalize request payloads before sending them through `api`.

### Testing Pattern

Pattern: Vitest and React Testing Library are used for frontend behavior.

Examples:

- `src/api.test.ts`
- `src/pages/Login.test.tsx`
- `src/pages/Servers.test.tsx`
- `src/setupTests.ts`

Rules:

- Test route/page behavior when user-visible interactions change.
- Test API client behavior when interceptors change.
- Prefer user-facing queries in React Testing Library tests.

## Change Checklist

When changing backend patterns:

1. Update this file.
2. Update `docs/ENTITIES.md` if data shape or persistence behavior changes.
3. Update affected tests or explain why no tests were needed.

When changing frontend patterns:

1. Update this file.
2. Update or create flow documentation when user journeys change.
3. Update locale files when user-facing copy changes.
4. Update permission docs and backend permission definitions when action visibility changes.

When adding a new pattern:

1. Document where it lives.
2. Explain when to use it.
3. Explain when not to use it.
4. Add a representative source file example.
