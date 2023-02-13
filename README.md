# Fin API

[![Jest](https://img.shields.io/badge/Jest-red?logo=jest&logoColor=white)](https://jestjs.io/)
[![Node.js](https://img.shields.io/badge/Node.js-green?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-blue?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Supertest](https://img.shields.io/badge/Supertest-yellowgreen?logoColor=white)](https://github.com/visionmedia/supertest)
[![TypeORM](https://img.shields.io/badge/TypeORM-blue?logo=typeorm&logoColor=white)](https://typeorm.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## 💻 Projeto

**Fin API** é o servidor de um bancário onde é possível criação de usuário, autenticação, depósitos, saques, transferências, consultas de saldo e transações.

Este projeto foi utilizado com solução para os seguinte desafios da trilha de Node:

- [Desafio 01 - Testes unitários](https://www.notion.so/Desafio-01-Testes-unit-rios-0321db2af07e4b48a85a1e4e360fcd11)
- [Desafio 02 - Testes de integração](https://www.notion.so/Desafio-02-Testes-de-integra-o-70a8af48044d444cb1d2c1fa00056958)
- [Desafio 01 - Transferências com a FinAPI](https://www.notion.so/Desafio-01-Transfer-ncias-com-a-FinAPI-5e1dbfc0bd66420f85f6a4948ad727c2)

## Requisitos

- Ter o banco de dados PostgreSQL rodando.

- Informações de conexão com banco de dados está no arquivo `ormconfig.json`

```json
{
  "username": "docker",
  "password": "ignite",
  "name": "default",
  "type": "postgres",
  "host": "localhost",
  "port": 5432,
  "database": "fin_api",
  "entities": ["./src/modules/**/entities/*.ts"],
  "migrations": ["./src/database/migrations/*.ts"],
  "cli": {
    "migrationsDir": "./src/database/migrations"
  }
}
```

## 🧭 Como rodar o projeto

**Clone este repositório**

```bash
git clone https://github.com/vitorsemidio-dev/ignite-tests-challenge.git
```

**Acesse a pasta**

```bash
cd ignite-tests-challenge
```

**Instale as dependências**

```bash
yarn install
```

**Execute a aplicação**

```bash
yarn dev
```

## 🚀 Tecnologias

Esse projeto foi desenvolvido com as seguintes tecnologias:

- [Jest](https://jestjs.io/)
- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Supertest](https://github.com/visionmedia/supertest)
- [TypeORM](https://typeorm.io/)
- [TypeScript](https://www.typescriptlang.org/)

## 📝 Licença

Esse projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
