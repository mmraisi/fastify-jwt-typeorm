import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateUser1711857842849 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS users (
                user_id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
                user_first_name TEXT NOT NULL,
                user_last_name TEXT,
                user_email TEXT NOT NULL UNIQUE,
                user_password TEXT NOT NULL,
                user_age INT,
                date_created TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                date_updated TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS users')
  }
}
