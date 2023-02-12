import request from "supertest";
import { v4 as uuidv4 } from "uuid";
import { app } from "../../../../app";
import {
  makeE2EDepositStatement,
  makeE2ETransferStatement,
  makeE2EWithdrawStatement,
} from "../../../../__tests__/StatementFactory";
import { TestDatabase } from "../../../../__tests__/TestDbConnection";
import { makeJWTToken } from "../../../../__tests__/TokenFactory";
import { makeE2EUser, makeUser } from "../../../../__tests__/UserFactory";
import { OperationType } from "../../entities/Statement";
import { GetStatementOperationError } from "./GetStatementOperationError";

describe("Get Statement Operation Controller", () => {
  beforeEach(async () => {
    await TestDatabase.create();
    await TestDatabase.drop();
    await TestDatabase.migrate();
  });

  afterAll(async () => {
    await TestDatabase.close();
  });

  it("should be able to get a statement operation", async () => {
    const { token, user } = await makeE2EUser(request(app), {
      email: "user_statement_operation@email.com",
    });
    const { user: receiver } = await makeE2EUser(request(app), {
      email: "receiver_statement_operation@email.com",
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

    const { body: balanceBody } = await request(app)
      .get("/api/v1/statements/balance")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    const [depositOperation, withdrawOperation, transferOperation] =
      balanceBody.statement;

    const { body: depositStatementOperationBody } = await request(app)
      .get(`/api/v1/statements/${depositOperation.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    const { body: withdrawStatementOperationBody } = await request(app)
      .get(`/api/v1/statements/${withdrawOperation.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    const { body: transferStatementOperationBody } = await request(app)
      .get(`/api/v1/statements/${transferOperation.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(depositStatementOperationBody).toEqual(
      expect.objectContaining({
        amount: depositStatementDto.amount,
        description: depositStatementDto.description,
        id: depositStatementBody.id,
        type: depositStatementDto.type,
      })
    );
    expect(withdrawStatementOperationBody).toEqual(
      expect.objectContaining({
        amount: withdrawStatementDto.amount,
        description: withdrawStatementDto.description,
        id: withdrawStatementBody.id,
        type: withdrawStatementDto.type,
      })
    );
    expect(transferStatementOperationBody).toEqual(
      expect.objectContaining({
        amount: transferStatementDto.amount,
        description: transferStatementDto.description,
        id: expect.any(String),
        sender_id: user.id,
        type: OperationType.TRANSFER,
      })
    );
  });

  it("should not be able to get a statement operation from a non-existent user", async () => {
    const user = makeUser();
    const { token } = makeJWTToken(user);
    const anyStatementId = uuidv4();
    const expectedError = new GetStatementOperationError.UserNotFound();

    const { body: errorBody } = await request(app)
      .get(`/api/v1/statements/${anyStatementId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(expectedError.statusCode);

    expect(errorBody).toEqual(
      expect.objectContaining({
        message: expectedError.message,
      })
    );
  });

  it("should not be able to get a statement operation from a non-existent statement", async () => {
    const { token } = await makeE2EUser(request(app));
    const anyStatementId = uuidv4();
    const expectedError = new GetStatementOperationError.StatementNotFound();

    const { body: errorBody } = await request(app)
      .get(`/api/v1/statements/${anyStatementId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(expectedError.statusCode);

    expect(errorBody).toEqual(
      expect.objectContaining({
        message: expectedError.message,
      })
    );
  });
});
