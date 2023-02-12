import { createConnection, ConnectionOptions } from "typeorm";

export const connectionOptions: ConnectionOptions = {
  username: "docker",
  password: "ignite",
  name: "default",
  type: "postgres",
  host: "localhost",
  port: 5432,
  database: process.env.NODE_ENV === "test" ? "fin_api_test" : "fin_api",
  entities: ["./src/modules/**/entities/*.ts"],
  migrations: ["./src/database/migrations/*.ts"],
  cli: {
    migrationsDir: "./src/database/migrations",
  },
};

(async () => await createConnection(connectionOptions))();
