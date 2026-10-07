import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableUsers1775784363508 implements MigrationInterface {
  name = 'CreateTableUsers1775784363508';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "name" character varying NOT NULL,
        "document" character varying NOT NULL,
        "password" character varying NOT NULL,
        "status" integer NOT NULL DEFAULT '1',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_users_document" UNIQUE ("document"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
