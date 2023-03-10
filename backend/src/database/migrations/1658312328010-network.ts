import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class network1658312328010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'network',
      new TableColumn({
        name: 'isActive',
        type: 'boolean',
        default: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('network', 'isActive');
  }
}
