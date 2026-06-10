import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStockAlertsTable1749430000000 implements MigrationInterface {
  name = 'CreateStockAlertsTable1749430000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "stock_alerts" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "symbol" character varying(20) NOT NULL,
        "target_price" decimal(12,4) NOT NULL,
        "is_triggered" boolean NOT NULL DEFAULT false,
        "triggered_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_stock_alerts_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_stock_alerts_user_id" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_stock_alerts_user_id" ON "stock_alerts" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_stock_alerts_symbol" ON "stock_alerts" ("symbol")
        WHERE "is_triggered" = false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "stock_alerts"`);
  }
}
