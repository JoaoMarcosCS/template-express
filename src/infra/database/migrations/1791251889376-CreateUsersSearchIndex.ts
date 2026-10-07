import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersSearchIndex1791251889376 implements MigrationInterface {
  name = 'CreateUsersSearchIndex1791251889376';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_users_search" ON "users"
        USING GIN (to_tsvector('simple', coalesce("name", '') || ' ' || coalesce("document", '') || ' ' || coalesce("email", '')))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_users_search"`);
  }
}
