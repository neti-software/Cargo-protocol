import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class strategy1659430823891 implements MigrationInterface {
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

    await queryRunner.addColumns('strategy', [
      executionPeriod,
      lastExecutionTimestamp,
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('strategy', 'executionPeriod');
    await queryRunner.dropColumn('strategy', 'lastExecutionTimestamp');
  }
}
