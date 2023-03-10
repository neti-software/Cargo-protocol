import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class strategyAddColApyAnnual1663577464197 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'strategy',
      new TableColumn({
        name: 'apyAnnual',
        type: 'mediumtext',
        isNullable: true
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('strategy', 'apyAnnual');
  }
}
