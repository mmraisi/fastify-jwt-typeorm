import { join } from 'node:path'
import Server from '../../app'
import { DataSource } from 'typeorm'

// Default database name (admin db)
const DEFAULT_DB_NAME = 'postgres'

// Base database name (template db), fallback to "test" if NODE_ENV is not defined
const BASE_DB_NAME = process.env.NODE_ENV || 'test'

// Current integration test database name with process ID to ensure uniqueness
export const TEST_DB_NAME = `test_${BASE_DB_NAME}_${process.pid}`

/**
 * Creates a Fastify instance with optional server options.
 * @param {any} serverOptions - Optional server options.
 * @returns {Promise<any>} - A Promise resolving to the created Fastify instance.
 */
export async function createFastifyInstance (serverOptions: any = {}) {
  const defaultLogger = {
    level: 'error'
  }
  const logger = serverOptions.logger ?? defaultLogger

  const server = new Server({ ...serverOptions, logger })

  await server.fastifyInstance.ready()

  return server.fastifyInstance
}

// Function to create a test data source
export const createDataSource = (database: string) => {
  const entities = join(__dirname, '..', 'entities')

  return new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: (process.env.POSTGRES_PORT ?? 5432) as number,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database,
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    entities: [entities + '/**/*.entity{.ts,.js}']
  })
}

// Function to provide integration test setup and teardown methods
export const integrationTestMethods = () => {
  let testDataSource: DataSource | null

  // Setup function to be executed before each test
  const beforeEach = async () => {
    const dataSource = createDataSource(DEFAULT_DB_NAME)
    await dataSource.initialize()
    const queryRunner = dataSource.createQueryRunner()
    await queryRunner.query(`DROP DATABASE IF EXISTS ${TEST_DB_NAME};`)
    await queryRunner.query(
      `CREATE DATABASE ${TEST_DB_NAME} WITH TEMPLATE ${BASE_DB_NAME};`
    )
    await queryRunner.release()
    await dataSource.destroy()

    testDataSource = createDataSource(TEST_DB_NAME)
    await testDataSource.initialize()

    return testDataSource
  }

  // Teardown function to be executed after each test
  const afterEach = async () => {
    if (testDataSource != null) {
      await testDataSource.destroy()
      testDataSource = null
    }

    const dataSource = createDataSource(DEFAULT_DB_NAME)
    await dataSource.initialize()
    const queryRunner = dataSource.createQueryRunner()
    await queryRunner.query(`DROP DATABASE IF EXISTS ${TEST_DB_NAME};`)
    await queryRunner.release()
    await dataSource.destroy()
  }

  return {
    beforeEach,
    afterEach
  }
}
