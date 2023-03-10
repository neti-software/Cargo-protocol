import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class pool1658234428893 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'pool',
      new TableColumn({
        name: 'order',
        type: 'int',
        isNullable: true,
        default: null,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('pool', 'order');
  }
}
