import request from "supertest";
import { app } from "../../../../app";
import {
  makeE2EDepositStatement,
  makeE2ETransferStatement,
  makeE2EWithdrawStatement,
} from "../../../../__tests__/StatementFactory";
import { TestDatabase } from "../../../../__tests__/TestDbConnection";
import { makeUser, makeUserDto } from "../../../../__tests__/UserFactory";
import { IAuthenticateUserResponseDTO } from "../../../users/useCases/authenticateUser/IAuthenticateUserResponseDTO";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType } from "./../../entities/Statement";

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
