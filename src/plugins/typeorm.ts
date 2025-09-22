import { FastifyInstance } from 'fastify'
import { DataSource } from 'typeorm'
import { generateDataSourceOptions } from '../database/data-source'

export default async function plugin (fastify: FastifyInstance, opts: any) {
  try {
    const connectionOptions = generateDataSourceOptions(opts)
    const db = new DataSource(connectionOptions)

    await db.initialize()
    console.log('Connected to the database successfully')

    await db.runMigrations()
    console.log('Migrations completed successfully')

    // Decorate fastify with the TypeORM DataSource instance
    fastify.decorate('db', db)

    // Listen for the server's onClose event
    fastify.addHook('onClose', async () => {
      try {
        // Close the database connection when the server shuts down
        if (db) {
          await db.destroy()
          console.log('Database connection closed successfully')
        }
      } catch (error) {
        console.error('Error closing database connection:', error)
      }
    })
  } catch (error) {
    console.error('Error connecting to the database:', error)
    throw error
  }
}
