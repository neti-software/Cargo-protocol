import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class strategy1659957646303 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const stakingProtocolAddress = new TableColumn({
      name: 'stakingProtocolAddress',
      type: 'varchar',
      isNullable: true,
    });

    await queryRunner.addColumns('strategy', [stakingProtocolAddress]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('strategy', 'stakingProtocolAddress');
  }
}
