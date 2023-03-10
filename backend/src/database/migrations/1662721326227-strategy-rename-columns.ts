import { MigrationInterface, QueryRunner } from 'typeorm';

export class strategyRenameColumns1662721326227 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('strategy', 'apyWeekly', 'feesWeekly');
    await queryRunner.renameColumn('strategy', 'apyAnnual', 'feesAnnual');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('strategy', 'feesWeekly', 'apyWeekly');
    await queryRunner.renameColumn('strategy', 'feesAnnual', 'apyAnnual');
  }
}
