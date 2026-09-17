import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexes1789568690604 implements MigrationInterface {
  name = 'AddIndexes1789568690604';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_e78774d95a5d698bb248e1c7d2" ON "users"  ("age") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_da741548a1a7a3e33ec13d67a2" ON "avatars"  ("userId", "createdAt") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_da741548a1a7a3e33ec13d67a2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e78774d95a5d698bb248e1c7d2"`,
    );
  }
}
