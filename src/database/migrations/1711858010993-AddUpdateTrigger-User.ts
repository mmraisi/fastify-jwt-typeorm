import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUpdateTriggerUser1711858010993 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_trigger WHERE tgname = 'users_update_date_updated'
                ) THEN
                    CREATE TRIGGER users_update_date_updated BEFORE
                    UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_date_updated ();
                END IF;
            END$$;
        `)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TRIGGER IF EXISTS users_update_date_updated ON users')
  }
}
