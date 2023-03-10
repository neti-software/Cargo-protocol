import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class network1657100594267 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'network',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'platform',
            type: 'varchar',
          },
          {
            name: 'networkUrl',
            type: 'varchar',
          },
          {
            name: 'chainId',
            type: 'varchar',
          },
          {
            name: 'transportProtocol',
            type: 'varchar',
          },
          {
            name: 'cargoServiceAddress',
            type: 'varchar',
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('network');
  }
}
