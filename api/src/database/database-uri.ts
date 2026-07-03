export type ParsedDatabaseUri =
  | { type: 'sqlite'; database: string }
  | { type: 'postgres'; url: string; ssl: boolean }
  | { type: 'mysql'; url: string; ssl: boolean };

export const SUPPORTED_DATABASE_URI_MESSAGE =
  'Use sqlite:<path>, postgres://..., postgresql://... or mysql://...';

/**
 * Detects the database driver from a single DATABASE_URI connection string.
 * Supported formats:
 *   sqlite:<path>              e.g. sqlite:database.sqlite, sqlite::memory:
 *   postgres://user:pass@host:port/db[?sslmode=require]
 *   postgresql://user:pass@host:port/db[?sslmode=require]
 *   mysql://user:pass@host:port/db[?ssl=true]
 */
export function parseDatabaseUri(uri: string): ParsedDatabaseUri {
  const trimmed = (uri ?? '').trim();

  if (trimmed.startsWith('sqlite:')) {
    const database = trimmed.slice('sqlite:'.length) || 'database.sqlite';
    return { type: 'sqlite', database };
  }

  if (trimmed.startsWith('postgres://') || trimmed.startsWith('postgresql://')) {
    return { type: 'postgres', url: trimmed, ssl: /[?&](sslmode=require|ssl=true)\b/.test(trimmed) };
  }

  if (trimmed.startsWith('mysql://')) {
    return { type: 'mysql', url: trimmed, ssl: /[?&]ssl=true\b/.test(trimmed) };
  }

  throw new Error(
    `Unsupported DATABASE_URI: "${trimmed}". ${SUPPORTED_DATABASE_URI_MESSAGE}`,
  );
}
