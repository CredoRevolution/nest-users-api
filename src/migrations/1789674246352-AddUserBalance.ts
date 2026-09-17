import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserBalance1789674246352 implements MigrationInterface {
  name = 'AddUserBalance1789674246352';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "balance" numeric(12,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "CHK_44ce82d481aee34b57145d49bf" CHECK (balance >= 0)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "CHK_44ce82d481aee34b57145d49bf"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "balance"`);
  }
}
