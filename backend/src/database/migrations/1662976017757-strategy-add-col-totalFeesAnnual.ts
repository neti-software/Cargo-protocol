import { MigrationInterface, QueryRunner } from 'typeorm';

export class strategyAddColTotalFeesAnnual1662976017757 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE strategy ADD COLUMN totalFeesAnnual VARCHAR(255) NULL AFTER feesAnnual'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('strategy', 'totalFeesAnnual');
  }
}
