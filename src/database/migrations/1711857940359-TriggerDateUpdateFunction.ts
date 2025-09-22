import { MigrationInterface, QueryRunner } from 'typeorm'

export class TriggerDateUpdateFunction1711857940359 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_date_updated()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.date_updated = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP FUNCTION IF EXISTS update_date_updated')
  }
}
