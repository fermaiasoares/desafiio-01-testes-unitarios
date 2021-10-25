import {MigrationInterface, QueryRunner, TableColumn, TableForeignKey} from "typeorm";

export class AddColumnSenderIdToStatementTable1635113105428 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.changeColumn('statements', 'type', new TableColumn({
        name: 'type',
        type: 'enum',
        enum: ['deposit', 'withdraw', 'transfer'],
      },))

      await queryRunner.addColumn('statements', new TableColumn({
        name: 'sender_id',
        type: 'uuid',
        isNullable: true,
      }))

      await queryRunner.createForeignKey('statements', new TableForeignKey({
        name: 'statements_sender_id_fk',
        columnNames: ['sender_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropForeignKey('statements', 'statements_sender_id_fk');
      await queryRunner.dropColumn('statements', 'sender_id');
      await queryRunner.changeColumn('statements', 'type', new TableColumn({
        name: 'type',
        type: 'enum',
        enum: ['deposit', 'withdraw'],
      },))
    }

}
