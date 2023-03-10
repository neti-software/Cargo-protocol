import { MigrationInterface, QueryRunner } from 'typeorm';

export class strategyAddColTotalFeesWeekly1662980758031 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE strategy ADD COLUMN totalFeesWeekly VARCHAR(255) NULL AFTER feesWeekly'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('strategy', 'totalFeesWeekly');
  }
}
