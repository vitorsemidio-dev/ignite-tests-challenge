import request from "supertest";
import { app } from "../../../../app";
import { makeDepositStatementDto } from "../../../../__tests__/StatementFactory";
import { makeUserDto } from "../../../../__tests__/UserFactory";
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
    const sender = makeUserDto({
      email: "sender1@email.com",
    });
    const receiver = makeUserDto({
      email: "receiver1@email.com",
    });
    await request(app).post("/api/v1/users").send(sender).expect(201);
    await request(app).post("/api/v1/users").send(receiver).expect(201);
    const { body: sessionSenderBody } = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: sender.email,
        password: sender.password,
      });
    const { body: sessionReceiverBody } = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: receiver.email,
        password: receiver.password,
      });
    const { token } = sessionSenderBody;
    const depositStatementDto = makeDepositStatementDto();
    await request(app)
      .post("/api/v1/statements/deposit")
      .set("Authorization", `Bearer ${token}`)
      .send(depositStatementDto)
      .expect(201);
    const requestBody = {
      amount: 100,
      description: "transfer_description",
    };

    await request(app)
      .post(`/api/v1/statements/transfers/${sessionReceiverBody.user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(requestBody)
      .expect(201);
  });

  it("should not be able to create a new transfer statement if the sender does not have enough funds", async () => {
    const expectedError = new CreateTransferStatementError.InsufficientFunds();
    const sender = makeUserDto({
      email: "sender1@email.com",
    });
    const receiver = makeUserDto({
      email: "receiver1@email.com",
    });
    await request(app).post("/api/v1/users").send(sender).expect(201);
    await request(app).post("/api/v1/users").send(receiver).expect(201);
    const { body: sessionSenderBody } = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: sender.email,
        password: sender.password,
      });
    const { body: sessionReceiverBody } = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: receiver.email,
        password: receiver.password,
      });
    const { token } = sessionSenderBody;

    const requestBody = {
      amount: 100,
      description: "transfer_description",
    };

    const { body: transferStatementBody } = await request(app)
      .post(`/api/v1/statements/transfers/${sessionReceiverBody.user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(requestBody)
      .expect(expectedError.statusCode);

    expect(transferStatementBody).toEqual(
      expect.objectContaining({
        message: expectedError.message,
      })
    );
  });

  it("should not be able to create a new transfer statement if the sender does not exist", async () => {});

  it("should not be able to create a new transfer statement if the receiver does not exist", async () => {});

  it("should not be able to create a new transfer statement if the sender is the same as the receiver", async () => {});
});
