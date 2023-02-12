import { createConnection, ConnectionOptions, getConnection } from "typeorm";

export const connectionOptions: ConnectionOptions = {
  username: "docker",
  password: "ignite",
  name: "default",
  type: "postgres",
  host: "localhost",
  port: 5432,
  database: "fin_api_test",
  entities: ["./src/modules/**/entities/*.ts"],
  migrations: ["./src/database/migrations/*.ts"],
  cli: {
    migrationsDir: "./src/database/migrations",
  },
};

export class TestDatabase {
  public static async create() {
    await createConnection(connectionOptions);
  }

  public static async close() {
    const connection = getConnection();
    await connection.close();
  }

  public static async clear() {
    const connection = getConnection();
    const entities = connection.entityMetadatas;

    entities.forEach(async (entity) => {
      const repository = connection.getRepository(entity.name);
      await repository.query(`DELETE FROM ${entity.tableName}`);
    });
  }

  public static async drop() {
    const connection = getConnection();
    await connection.dropDatabase();
    return;
  }

  public static async migrate() {
    const connection = getConnection();
    await connection.runMigrations();
  }
}
