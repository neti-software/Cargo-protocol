import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class network1658136397560 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'network',
      new TableColumn({
        name: 'graphqlUrl',
        type: 'varchar',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('network', 'graphqlUrl');
  }
}
