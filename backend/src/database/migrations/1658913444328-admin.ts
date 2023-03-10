import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class admin1658913444328 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'admin',
      new TableColumn({
        name: 'nonce',
        type: 'varchar',
        isNullable: true,
        default: null,
      })
    );

    await queryRunner.addColumn(
      'admin',
      new TableColumn({
        name: 'nonceTimestamp',
        type: 'timestamp',
        isNullable: true,
        default: null,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('admin', 'nonce');
    await queryRunner.dropColumn('admin', 'nonceTimestamp');
  }
}
