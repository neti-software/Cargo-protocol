import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class admin1660287044204 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'admin',
      new TableColumn({
        name: 'role',
        type: 'varchar'
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('admin', 'role');
  }
}
