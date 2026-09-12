import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAvatars1789247071474 implements MigrationInterface {
    name = 'AddAvatars1789247071474'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "avatars" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "userId" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_224de7bae2014a1557cd9930ed7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "avatars" ADD CONSTRAINT "FK_b22f4499b339d4362f86c87dfbe" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "avatars" DROP CONSTRAINT "FK_b22f4499b339d4362f86c87dfbe"`);
        await queryRunner.query(`DROP TABLE "avatars"`);
    }

}
