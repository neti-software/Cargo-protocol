import { database } from '@database/config/config';
import { ConnectionOptions } from 'typeorm';

const ormConfig: ConnectionOptions = {
  ...database,
  migrationsTableName: 'migrate_tables',
  synchronize: false,
  logger: 'file',
  migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
  cli: {
    migrationsDir: 'src/database/migrations'
  }
};

export = ormConfig;
