import request from "supertest";
import { app } from "../../../../app";
import { makeE2EDepositStatement } from "../../../../__tests__/StatementFactory";
import { makeJWTToken } from "../../../../__tests__/TokenFactory";
import { makeE2EUser, makeUser } from "../../../../__tests__/UserFactory";
import { TestDatabase } from "./../../../../__tests__/TestDbConnection";
import { CreateTransferStatementError } from "./CreateTransferStatementError";

describe("Create Transfer Statement Controller", () => {
  beforeEach(async () => {
    await TestDatabase.create();
    await TestDatabase.drop();
    await TestDatabase.migrate();
  });
  afterAll(async () => {
    await TestDatabase.close();
  });

  it("should be able to create a new transfer statement", async () => {
    const sender = await makeE2EUser(request(app), {
      email: "sender@email.com",
    });
    const receiver = await makeE2EUser(request(app), {
      email: "receiver@email.com",
    });
    await makeE2EDepositStatement(request(app), {}, { token: sender.token });

    const requestBody = {
      amount: 100,
      description: "transfer_description",
    };

    await request(app)
      .post(`/api/v1/statements/transfers/${receiver.user.id}`)
      .set("Authorization", `Bearer ${sender.token}`)
      .send(requestBody)
      .expect(201);
  });

  it("should not be able to create a new transfer statement if the sender does not have enough funds", async () => {
    const expectedError = new CreateTransferStatementError.InsufficientFunds();
    const sender = await makeE2EUser(request(app), {
      email: "sender@email.com",
    });
    const receiver = await makeE2EUser(request(app), {
      email: "receiver@email.com",
    });

    const requestBody = {
      amount: 100,
      description: "transfer_description",
    };

    const { body: transferStatementBody } = await request(app)
      .post(`/api/v1/statements/transfers/${receiver.user.id}`)
      .set("Authorization", `Bearer ${sender.token}`)
      .send(requestBody)
      .expect(expectedError.statusCode);

    expect(transferStatementBody).toEqual(
      expect.objectContaining({
        message: expectedError.message,
      })
    );
  });

  it("should not be able to create a new transfer statement if the sender does not exist", async () => {
    const expectedError = new CreateTransferStatementError.UserNotFound(
      "Sender not found"
    );
    const sender = makeUser({
      email: "sender@email.com",
    });
    const { token: senderToken } = makeJWTToken(sender);
    const receiver = await makeE2EUser(request(app), {
      email: "receiver@email.com",
    });

    const requestBody = {
      amount: 100,
      description: "transfer_description",
    };

    const { body: transferStatementBody } = await request(app)
      .post(`/api/v1/statements/transfers/${receiver.user.id}`)
      .set("Authorization", `Bearer ${senderToken}`)
      .send(requestBody)
      .expect(expectedError.statusCode);

    expect(transferStatementBody).toEqual(
      expect.objectContaining({
        message: expectedError.message,
      })
    );
  });

  it("should not be able to create a new transfer statement if the receiver does not exist", async () => {
    const expectedError = new CreateTransferStatementError.UserNotFound(
      "Receiver not found"
    );
    const sender = await makeE2EUser(request(app), {
      email: "sender@email.com",
    });
    const receiver = makeUser({
      email: "receiver@email.com",
    });

    const requestBody = {
      amount: 100,
      description: "transfer_description",
    };

    const { body: transferStatementBody } = await request(app)
      .post(`/api/v1/statements/transfers/${receiver.id}`)
      .set("Authorization", `Bearer ${sender.token}`)
      .send(requestBody)
      .expect(expectedError.statusCode);

    expect(transferStatementBody).toEqual(
      expect.objectContaining({
        message: expectedError.message,
      })
    );
  });

  it("should not be able to create a new transfer statement if the sender is the same as the receiver", async () => {
    const expectedError = new CreateTransferStatementError.OperationForbidden(
      "You can't transfer to yourself"
    );
    const sender = await makeE2EUser(request(app), {
      email: "sender@email.com",
    });

    const requestBody = {
      amount: 100,
      description: "transfer_description",
    };

    const { body: transferStatementBody } = await request(app)
      .post(`/api/v1/statements/transfers/${sender.user.id}`)
      .set("Authorization", `Bearer ${sender.token}`)
      .send(requestBody)
      .expect(expectedError.statusCode);

    expect(transferStatementBody).toEqual(
      expect.objectContaining({
        message: expectedError.message,
      })
    );
  });
});
