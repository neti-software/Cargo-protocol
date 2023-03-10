import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class network1659436907152 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const executionPeriod = new TableColumn({
      name: 'executionPeriod',
      type: 'varchar(45)',
    });

    const lastExecutionTimestamp = new TableColumn({
      name: 'lastExecutionTimestamp',
      type: 'timestamp',
      isNullable: true,
      default: null,
    });

    await queryRunner.addColumns('network', [
      executionPeriod,
      lastExecutionTimestamp,
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('network', 'executionPeriod');
    await queryRunner.dropColumn('network', 'lastExecutionTimestamp');
  }
}
