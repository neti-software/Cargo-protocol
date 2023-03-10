import { MigrationInterface, QueryRunner } from 'typeorm';

export class strategyChangeTypeFeesWeekly1662730752987
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE strategy MODIFY COLUMN feesWeekly MEDIUMTEXT NULL DEFAULT NULL;'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('strategy', 'feesWeekly');
  }
}
