import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

function idType(queryRunner: QueryRunner): string {
  return queryRunner.connection.options.type === 'postgres' ? 'uuid' : 'varchar';
}

function timestampType(queryRunner: QueryRunner): string {
  return queryRunner.connection.options.type === 'postgres' ? 'timestamp' : 'datetime';
}

function timestampDefault(queryRunner: QueryRunner): string {
  if (queryRunner.connection.options.type === 'postgres') return 'now()';
  if (queryRunner.connection.options.type === 'mysql') return 'CURRENT_TIMESTAMP';
  return "datetime('now')";
}

export class CreateMcpApps1700000000003 implements MigrationInterface {
  name = 'CreateMcpApps1700000000003';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('mcp_apps')) return;
    const uuidType = idType(queryRunner);
    await queryRunner.createTable(new Table({
      name: 'mcp_apps',
      columns: [
        { name: 'id', type: uuidType, length: uuidType === 'varchar' ? '36' : undefined, isPrimary: true, isGenerated: uuidType === 'uuid', generationStrategy: uuidType === 'uuid' ? 'uuid' : undefined },
        { name: 'name', type: 'varchar' },
        { name: 'description', type: 'varchar', isNullable: true },
        { name: 'server_id', type: uuidType, length: uuidType === 'varchar' ? '36' : undefined },
        { name: 'tool_name', type: 'varchar' },
        { name: 'view_type', type: 'varchar' },
        { name: 'view_config', type: 'text', default: "'{}'" },
        { name: 'is_active', type: 'boolean', default: true },
        { name: 'created_at', type: timestampType(queryRunner), default: timestampDefault(queryRunner) },
        { name: 'updated_at', type: timestampType(queryRunner), default: timestampDefault(queryRunner), onUpdate: queryRunner.connection.options.type === 'mysql' ? 'CURRENT_TIMESTAMP' : undefined },
      ],
    }), true);
    await queryRunner.createIndex('mcp_apps', new TableIndex({ name: 'idx_mcp_apps_server_id', columnNames: ['server_id'] }));
    await queryRunner.createIndex('mcp_apps', new TableIndex({ name: 'uq_mcp_apps_server_tool', columnNames: ['server_id', 'tool_name'], isUnique: true }));
    await queryRunner.createForeignKey('mcp_apps', new TableForeignKey({
      name: 'fk_mcp_apps_server',
      columnNames: ['server_id'],
      referencedTableName: 'swagger_projects',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('mcp_apps')) await queryRunner.dropTable('mcp_apps', true);
  }
}
