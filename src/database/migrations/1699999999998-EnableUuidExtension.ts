import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnableUuidExtension1699999999998 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // MySQL não precisa de extensão UUID, usa VARCHAR(36) ou CHAR(36)
    // Esta migration está vazia mas mantida para compatibilidade
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Nada a fazer
  }
}
