import { MigrationInterface, QueryRunner, Table } from 'typeorm';

type ColumnType = ConstructorParameters<typeof Table>[0]['columns'][number];

function isPostgres(queryRunner: QueryRunner): boolean {
  return queryRunner.connection.options.type === 'postgres';
}

function isMysql(queryRunner: QueryRunner): boolean {
  return queryRunner.connection.options.type === 'mysql';
}

function idColumn(queryRunner: QueryRunner): ColumnType {
  if (isPostgres(queryRunner)) {
    return {
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      isGenerated: true,
      generationStrategy: 'uuid',
      default: 'uuid_generate_v4()',
    };
  }

  return {
    name: 'id',
    type: 'varchar',
    length: '36',
    isPrimary: true,
  };
}

function timestampColumn(queryRunner: QueryRunner, name: string, update = false, options: Partial<ColumnType> = {}): ColumnType {
  if (isPostgres(queryRunner)) {
    return { name, type: 'timestamp', default: 'now()', ...options };
  }

  if (isMysql(queryRunner)) {
    return {
      name,
      type: 'datetime',
      default: 'CURRENT_TIMESTAMP',
      onUpdate: update ? 'CURRENT_TIMESTAMP' : undefined,
      ...options,
    };
  }

  return { name, type: 'datetime', default: "datetime('now')", ...options };
}

function dateTimeColumn(queryRunner: QueryRunner, name: string, options: Partial<ColumnType> = {}): ColumnType {
  if (isPostgres(queryRunner)) {
    return { name, type: 'timestamp', ...options };
  }

  return { name, type: 'datetime', ...options };
}

function varcharColumn(name: string, options: Partial<ColumnType> = {}): ColumnType {
  return { name, type: 'varchar', ...options };
}

function textColumn(name: string, options: Partial<ColumnType> = {}): ColumnType {
  return { name, type: 'text', ...options };
}

function booleanColumn(name: string, defaultValue: boolean): ColumnType {
  return { name, type: 'boolean', default: defaultValue };
}

function integerColumn(name: string, defaultValue: number): ColumnType {
  return { name, type: 'int', default: defaultValue };
}

async function createTableIfMissing(queryRunner: QueryRunner, table: Table): Promise<void> {
  if (!(await queryRunner.hasTable(table.name))) {
    await queryRunner.createTable(table, true);
  }
}

export class InitialTypeormSchema1700000000000 implements MigrationInterface {
  name = 'InitialTypeormSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (isPostgres(queryRunner)) {
      await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    }

    await createTableIfMissing(queryRunner, new Table({
      name: 'users',
      columns: [
        idColumn(queryRunner),
        varcharColumn('username', { isUnique: true }),
        varcharColumn('email', { isUnique: true }),
        varcharColumn('password'),
        varcharColumn('role', { default: "'user'" }),
        timestampColumn(queryRunner, 'created_at'),
        timestampColumn(queryRunner, 'updated_at', true),
      ],
    }));

    await createTableIfMissing(queryRunner, new Table({
      name: 'swagger_projects',
      columns: [
        idColumn(queryRunner),
        varcharColumn('name'),
        varcharColumn('base_url'),
        varcharColumn('description', { isNullable: true }),
        varcharColumn('version', { isNullable: true }),
        varcharColumn('share_slug', { isNullable: true, isUnique: true }),
        textColumn('raw_spec', { isNullable: true }),
        textColumn('tools', { default: "'[]'" }),
        textColumn('auth', { default: '\'{"type":"none"}\'' }),
        varcharColumn('status', { default: "'active'" }),
        varcharColumn('error_message', { isNullable: true }),
        varcharColumn('mcp_api_key', { isNullable: true }),
        textColumn('mcp_api_keys', { default: "'[]'" }),
        textColumn('resources', { default: "'[]'" }),
        textColumn('prompts', { default: "'[]'" }),
        textColumn('chains', { default: "'[]'" }),
        varcharColumn('oauth_client_id', { isNullable: true }),
        varcharColumn('oauth_client_secret', { isNullable: true }),
        textColumn('tags', { default: "'[]'" }),
        textColumn('rate_limit', { default: '\'{"enabled":false,"requestsPerMinute":60}\'' }),
        booleanColumn('is_paused', false),
        textColumn('maintenance_mode', { default: '\'{"enabled":false,"message":""}\'' }),
        textColumn('availability_window', { default: '\'{"enabled":false,"timezone":"UTC","schedule":[]}\'' }),
        textColumn('alert_config', { default: '\'{"enabled":false,"errorThresholdPct":20,"notifyEmail":""}\'' }),
        textColumn('tenant_config', { default: '\'{"enabled":false,"params":[]}\'' }),
        textColumn('response_config', { default: '\'{"enabled":false}\'' }),
        textColumn('connection_config', { isNullable: true }),
        textColumn('db_queries', { default: "'[]'" }),
        timestampColumn(queryRunner, 'created_at'),
        timestampColumn(queryRunner, 'updated_at', true),
      ],
    }));

    await createTableIfMissing(queryRunner, new Table({
      name: 'settings',
      columns: [
        idColumn(queryRunner),
        varcharColumn('key', { isUnique: true, default: "'global'" }),
        varcharColumn('server_base_url', { default: "''" }),
        integerColumn('default_timeout_ms', 30000),
        varcharColumn('smtp_host', { default: "''" }),
        integerColumn('smtp_port', 587),
        varcharColumn('smtp_user', { default: "''" }),
        varcharColumn('smtp_pass', { default: "''" }),
        varcharColumn('smtp_from', { default: "''" }),
        varcharColumn('jwt_secret', { default: "''" }),
        textColumn('global_request_headers', { isNullable: true }),
        textColumn('observability_environment', { isNullable: true }),
      ],
    }));

    await createTableIfMissing(queryRunner, new Table({
      name: 'password_resets',
      columns: [
        idColumn(queryRunner),
        varcharColumn('user_id'),
        varcharColumn('token', { isUnique: true }),
        dateTimeColumn(queryRunner, 'expires_at'),
        booleanColumn('used', false),
        timestampColumn(queryRunner, 'created_at'),
      ],
    }));

    await createTableIfMissing(queryRunner, new Table({
      name: 'prompts',
      columns: [
        idColumn(queryRunner),
        varcharColumn('name'),
        varcharColumn('description', { isNullable: true }),
        textColumn('content'),
        textColumn('tags_json', { default: "'[]'" }),
        timestampColumn(queryRunner, 'created_at'),
        timestampColumn(queryRunner, 'updated_at', true),
      ],
    }));

    await createTableIfMissing(queryRunner, new Table({
      name: 'secrets',
      columns: [
        idColumn(queryRunner),
        varcharColumn('name', { isUnique: true }),
        textColumn('value'),
        varcharColumn('description', { isNullable: true }),
        timestampColumn(queryRunner, 'created_at'),
        timestampColumn(queryRunner, 'updated_at', true),
      ],
    }));

    await createTableIfMissing(queryRunner, new Table({
      name: 'roles',
      columns: [
        idColumn(queryRunner),
        varcharColumn('name', { isUnique: true }),
        varcharColumn('description', { isNullable: true }),
        textColumn('permissions'),
        timestampColumn(queryRunner, 'created_at'),
        timestampColumn(queryRunner, 'updated_at', true),
      ],
    }));

    await createTableIfMissing(queryRunner, new Table({
      name: 'error_tracking_providers',
      columns: [
        idColumn(queryRunner),
        varcharColumn('name'),
        varcharColumn('description', { isNullable: true }),
        varcharColumn('tool'),
        textColumn('dsn'),
        varcharColumn('project_name', { isNullable: true }),
        varcharColumn('environment', { isNullable: true }),
        booleanColumn('is_active', false),
        timestampColumn(queryRunner, 'created_at'),
        timestampColumn(queryRunner, 'updated_at', true),
      ],
    }));

    await createTableIfMissing(queryRunner, new Table({
      name: 'ai_providers',
      columns: [
        idColumn(queryRunner),
        varcharColumn('name'),
        varcharColumn('description', { isNullable: true }),
        varcharColumn('provider'),
        varcharColumn('model'),
        textColumn('api_key'),
        varcharColumn('base_url', { isNullable: true }),
        booleanColumn('is_active', true),
        booleanColumn('is_default', false),
        varcharColumn('last_test_status', { isNullable: true }),
        dateTimeColumn(queryRunner, 'last_tested_at', { isNullable: true }),
        varcharColumn('last_test_error', { isNullable: true }),
        timestampColumn(queryRunner, 'created_at'),
        timestampColumn(queryRunner, 'updated_at', true),
      ],
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of [
      'ai_providers',
      'error_tracking_providers',
      'roles',
      'secrets',
      'prompts',
      'password_resets',
      'settings',
      'swagger_projects',
      'users',
    ]) {
      if (await queryRunner.hasTable(table)) {
        await queryRunner.dropTable(table, true);
      }
    }
  }
}
