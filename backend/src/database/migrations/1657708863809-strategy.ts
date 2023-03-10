import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class strategy1657708863809 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('strategy', 'guniPoolAddress');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'strategy',
      new TableColumn({
        name: 'guniPoolAddress',
        type: 'varchar',
      })
    );
  }
}
