import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class strategy1657104423134 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'strategy',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: 'poolId',
            type: 'varchar',
          },
          {
            name: 'address',
            type: 'varchar',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'rangePercentage',
            type: 'int',
          },
          {
            name: 'guniPoolAddress',
            type: 'varchar',
          },
        ],
      }),
      true
    );
    await queryRunner.createForeignKey(
      'strategy',
      new TableForeignKey({
        columnNames: ['poolId'],
        referencedTableName: 'pool',
        referencedColumnNames: ['id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('strategy');
  }
}
