import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class network1659704344514 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const websocketUrl = new TableColumn({
      name: 'rpcUrl',
      type: 'varchar',
    });

    await queryRunner.addColumns('network', [websocketUrl]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('network', 'rpcUrl');
  }
}
