import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class pool1657282954379 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'pool',
      'isActive',
      new TableColumn({
        name: 'isActive',
        type: 'boolean',
        default: true,
      })
    );
    await queryRunner.dropColumn('pool', 'apr');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'pool',
      'isActive',
      new TableColumn({
        name: 'isActive',
        type: 'boolean',
      })
    );
    await queryRunner.addColumn(
      'pool',
      new TableColumn({
        name: 'apr',
        type: 'boolean',
      })
    );
  }
}
