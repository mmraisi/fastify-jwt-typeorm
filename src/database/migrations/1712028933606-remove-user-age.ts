import { MigrationInterface, QueryRunner } from 'typeorm'

export class RemoveUserAge1712028933606 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    // Execute SQL query to remove the column
    await queryRunner.dropColumn('users', 'user_age')
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    // Execute SQL query to add the column back
    await queryRunner.query('ALTER TABLE users ADD COLUMN user_age INT')
  }
}
