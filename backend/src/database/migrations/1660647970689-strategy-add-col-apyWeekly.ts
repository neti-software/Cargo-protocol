import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class strategyAddColApyWeekly1660647970689
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'strategy',
      new TableColumn({
        name: 'apyWeekly',
        type: 'varchar(500)',
        isNullable: true
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('strategy', 'apyWeekly');
  }
}
