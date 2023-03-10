import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class pool1657100604261 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'pool',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: 'networkId',
            type: 'varchar',
          },
          {
            name: 'token0Address',
            type: 'varchar',
          },
          {
            name: 'token0Name',
            type: 'varchar',
          },
          {
            name: 'token1Address',
            type: 'varchar',
          },
          {
            name: 'token1Name',
            type: 'varchar',
          },
          {
            name: 'fee',
            type: 'varchar',
          },
          {
            name: 'apr',
            type: 'varchar',
          },
          {
            name: 'uniswapPoolAddress',
            type: 'varchar',
          },
          {
            name: 'isActive',
            type: 'boolean',
          },
        ],
      }),
      true
    );
    await queryRunner.createForeignKey(
      'pool',
      new TableForeignKey({
        columnNames: ['networkId'],
        referencedTableName: 'network',
        referencedColumnNames: ['id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pool');
  }
}
