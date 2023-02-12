import request from "supertest";
import { app } from "../../../../app";
import { makeDepositStatementDto } from "../../../../__tests__/StatementFactory";
import { makeUser, makeUserDto } from "../../../../__tests__/UserFactory";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { TestDatabase } from "./../../../../__tests__/TestDbConnection";
import { IAuthenticateUserResponseDTO } from "./../../../users/useCases/authenticateUser/IAuthenticateUserResponseDTO";
import { CreateTransferStatementError } from "./CreateTransferStatementError";

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
    const sender = await makeE2EUser({
      email: "sender1@email.com",
    });
    const receiver = await makeE2EUser({
      email: "receiver1@email.com",
    });
    const depositStatementDto = makeDepositStatementDto();
    await request(app)
      .post("/api/v1/statements/deposit")
      .set("Authorization", `Bearer ${sender.token}`)
      .send(depositStatementDto)
      .expect(201);
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
    const sender = await makeE2EUser({
      email: "sender1@email.com",
    });
    const receiver = await makeE2EUser({
      email: "receiver1@email.com",
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

  it("should not be able to create a new transfer statement if the sender does not exist", async () => {});

  it("should not be able to create a new transfer statement if the receiver does not exist", async () => {});

  it("should not be able to create a new transfer statement if the sender is the same as the receiver", async () => {});
});
