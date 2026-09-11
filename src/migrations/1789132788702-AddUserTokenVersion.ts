import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserTokenVersion1789132788702 implements MigrationInterface {
  name = 'AddUserTokenVersion1789132788702';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "tokenVersion" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "tokenVersion"`);
  }
}
