import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class strategyAddColApy1662721574930 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'strategy',
      new TableColumn({
        name: 'apy',
        type: 'varchar',
        isNullable: true
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('strategy', 'apy');
  }
}
