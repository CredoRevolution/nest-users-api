import { MigrationInterface, QueryRunner } from 'typeorm';

export class AvatarsPartialIndex1793025202178 implements MigrationInterface {
  name = 'AvatarsPartialIndex1793025202178';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_da741548a1a7a3e33ec13d67a2"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1e9a2dada5d222188aa7e977d6" ON "avatars"  ("userId", "createdAt") WHERE "deletedAt" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1e9a2dada5d222188aa7e977d6"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_da741548a1a7a3e33ec13d67a2" ON "avatars" USING btree ("userId", "createdAt") `,
    );
  }
}
