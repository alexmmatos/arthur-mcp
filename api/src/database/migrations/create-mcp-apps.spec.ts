import { DataSource } from 'typeorm';
import { InitialTypeormSchema1700000000000 } from './1700000000000-InitialTypeormSchema';
import { CreateMcpApps1700000000003 } from './1700000000003-CreateMcpApps';

describe('CreateMcpApps1700000000003', () => {
  let dataSource: DataSource;

  beforeEach(async () => {
    dataSource = new DataSource({ type: 'sqlite', database: ':memory:' });
    await dataSource.initialize();
  });

  afterEach(async () => {
    if (dataSource.isInitialized) await dataSource.destroy();
  });

  it('creates the App table, source foreign key, and one-App-per-tool constraint', async () => {
    const queryRunner = dataSource.createQueryRunner();
    await new InitialTypeormSchema1700000000000().up(queryRunner);
    const migration = new CreateMcpApps1700000000003();
    await migration.up(queryRunner);

    const table = await queryRunner.getTable('mcp_apps');
    expect(table).toBeDefined();
    expect(table?.foreignKeys[0]).toEqual(expect.objectContaining({
      columnNames: ['server_id'], referencedTableName: 'swagger_projects', onDelete: 'CASCADE',
    }));
    expect(table?.indices.some((index) => index.isUnique && index.columnNames.join(',') === 'server_id,tool_name')).toBe(true);

    await migration.down(queryRunner);
    expect(await queryRunner.hasTable('mcp_apps')).toBe(false);
    await queryRunner.release();
  });
});
