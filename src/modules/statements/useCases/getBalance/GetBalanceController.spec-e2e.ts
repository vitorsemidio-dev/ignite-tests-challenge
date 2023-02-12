import { OperationType } from "./../../entities/Statement";
import request from "supertest";
import { app } from "../../../../app";
import {
  makeDepositStatementDto,
  makeTransferStatementDto,
  makeWithdrawStatementDto,
} from "../../../../__tests__/StatementFactory";
import { TestDatabase } from "../../../../__tests__/TestDbConnection";
import { makeUser, makeUserDto } from "../../../../__tests__/UserFactory";
import { IAuthenticateUserResponseDTO } from "../../../users/useCases/authenticateUser/IAuthenticateUserResponseDTO";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";

const makeE2EUser = async (
  overrideCreateUserDto: Partial<ICreateUserDTO> = {}
) => {
  const userDto = makeUserDto({
    ...overrideCreateUserDto,
  });
  await request(app).post("/api/v1/users").send(userDto).expect(201);
  const { body } = await request(app).post("/api/v1/sessions").send({
    email: userDto.email,
    password: userDto.password,
  });

  const sessionBody = body as IAuthenticateUserResponseDTO;
  const user = makeUser({
    ...sessionBody.user,
    ...userDto,
  });

  return {
    token: sessionBody.token,
    user,
  };
};

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
    const { token } = await makeE2EUser({
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
    const expectedAmount = 500;
    const { token, user } = await makeE2EUser({
      email: "user_balance@email.com",
    });
    const { user: receiver } = await makeE2EUser({
      email: "receiver_balance@email.com",
    });

    const depositStatementDto = makeDepositStatementDto({
      amount: 900,
      description: "deposit_description 1",
      user_id: user.id,
    });
    const withdrawStatementDto = makeWithdrawStatementDto({
      amount: 250,
      description: "withdraw_description 1",
      user_id: user.id,
    });
    const transferStatementDto = makeTransferStatementDto({
      amount: 150,
      description: "transfer_description 1",
      sender_id: user.id,
      receiver_id: receiver.id,
    });

    const { body: depositStatementBody } = await request(app)
      .post("/api/v1/statements/deposit")
      .set("Authorization", `Bearer ${token}`)
      .send(depositStatementDto)
      .expect(201);
    const { body: withdrawStatementBody } = await request(app)
      .post("/api/v1/statements/withdraw")
      .set("Authorization", `Bearer ${token}`)
      .send(withdrawStatementDto)
      .expect(201);
    await request(app)
      .post(`/api/v1/statements/transfers/${receiver.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(transferStatementDto)
      .expect(201);

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty("balance");
    expect(response.body).toHaveProperty("statement");
    expect(response.body).toEqual(
      expect.objectContaining({
        balance: expectedAmount,
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
});
