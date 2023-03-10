import { MigrationInterface, QueryRunner } from 'typeorm';

export class strategyChangeApyWeeklyLength1661250448218
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(
      'ALTER TABLE strategy MODIFY COLUMN apyWeekly VARCHAR(2000) NULL DEFAULT NULL;'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.dropColumn('strategy', 'apyWeekly');
  }
}
