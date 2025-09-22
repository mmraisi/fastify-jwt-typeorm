import { DataSourceOptions } from 'typeorm'

export const generateDataSourceOptions = (opts: any) => {
  const {
    NODE_ENV,
    POSTGRES_HOST,
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_PORT,
    POSTGRES_DB
  } = process.env

  let DB_NAME: string = ''

  const overrideTestDbName = opts?.db?.overrideTestDbName

  if (['test', 'development'].includes(NODE_ENV ?? '')) {
    DB_NAME = overrideTestDbName ?? NODE_ENV
  } else {
    DB_NAME = POSTGRES_DB ?? ''
  }

  const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: POSTGRES_HOST ?? 'localhost',
    port: (POSTGRES_PORT ?? 5432) as number,
    username: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: DB_NAME,
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    entities: [__dirname + '/entities/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    subscribers: [],
    migrationsTableName: 'migration_table'
  }

  return dataSourceOptions
}
