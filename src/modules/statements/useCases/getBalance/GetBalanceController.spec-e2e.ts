import request from "supertest";
import { app } from "../../../../app";
import {
  makeE2EDepositStatement,
  makeE2ETransferStatement,
  makeE2EWithdrawStatement,
} from "../../../../__tests__/StatementFactory";
import { TestDatabase } from "../../../../__tests__/TestDbConnection";
import { makeJWTToken } from "../../../../__tests__/TokenFactory";
import { makeE2EUser, makeUser } from "../../../../__tests__/UserFactory";
import { OperationType } from "./../../entities/Statement";
import { GetBalanceError } from "./GetBalanceError";

describe("Get Balance Controller", () => {
  beforeEach(async () => {
    await TestDatabase.create();
    await TestDatabase.drop();
    await TestDatabase.migrate();
  });

  afterAll(async () => {
    await TestDatabase.close();
  });

  it("should be able to get empty balance", async () => {
    const { token } = await makeE2EUser(request(app), {
      email: "user_balance@email.com",
    });

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty("balance");
    expect(response.body).toHaveProperty("statement");
    expect(response.body).toEqual(
      expect.objectContaining({
        balance: 0,
        statement: [],
      })
    );
  });

  it("should be able to get balance", async () => {
    const expectedBalance = 500;
    const { token, user } = await makeE2EUser(request(app), {
      email: "user_balance@email.com",
    });
    const { user: receiver } = await makeE2EUser(request(app), {
      email: "receiver_balance@email.com",
    });

    const { body: depositStatementBody, dto: depositStatementDto } =
      await makeE2EDepositStatement(
        request(app),
        {
          amount: 900,
          description: "deposit_description 1",
          user_id: user.id,
        },
        { token }
      );
    const { body: withdrawStatementBody, dto: withdrawStatementDto } =
      await makeE2EWithdrawStatement(
        request(app),
        {
          amount: 250,
          description: "withdraw_description 1",
          user_id: user.id,
        },
        { token }
      );
    const { body: transferStatementBody, dto: transferStatementDto } =
      await makeE2ETransferStatement(
        request(app),
        {
          amount: 150,
          description: "transfer_description 1",
          sender_id: user.id,
          receiver_id: receiver.id,
        },
        { token }
      );

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty("balance");
    expect(response.body).toHaveProperty("statement");
    expect(response.body).toEqual(
      expect.objectContaining({
        balance: expectedBalance,
        statement: expect.objectContaining([
          expect.objectContaining({
            amount: depositStatementDto.amount,
            description: depositStatementDto.description,
            id: depositStatementBody.id,
            type: depositStatementDto.type,
          }),
          expect.objectContaining({
            amount: withdrawStatementDto.amount,
            description: withdrawStatementDto.description,
            id: withdrawStatementBody.id,
            type: withdrawStatementDto.type,
          }),
          expect.objectContaining({
            amount: transferStatementDto.amount,
            description: transferStatementDto.description,
            id: expect.any(String),
            sender_id: user.id,
            type: OperationType.TRANSFER,
          }),
        ]),
      })
    );
  });

  it("should not be able to get balance from non-existent user", async () => {
    const expectedError = new GetBalanceError();
    const user = makeUser();
    const { token } = makeJWTToken(user);

    const { body } = await request(app)
      .get("/api/v1/statements/balance")
      .set("Authorization", `Bearer ${token}`)
      .expect(expectedError.statusCode);

    expect(body).toEqual(
      expect.objectContaining({
        message: expectedError.message,
      })
    );
  });
});
