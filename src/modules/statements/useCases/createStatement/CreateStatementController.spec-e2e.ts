import request from "supertest";
import { app } from "../../../../app";
import {
  makeDepositStatementDto,
  makeWithdrawStatementDto,
} from "../../../../__tests__/StatementFactory";
import { TestDatabase } from "../../../../__tests__/TestDbConnection";
import { makeJWTToken } from "../../../../__tests__/TokenFactory";
import { makeUser, makeUserDto } from "../../../../__tests__/UserFactory";
import { JWTTokenMissingError } from "./../../../../shared/errors/JWTTokenMissingError";
import { CreateStatementError } from "./CreateStatementError";

describe("CreateStatementController", () => {
  beforeEach(async () => {
    await TestDatabase.create();
    await TestDatabase.drop();
    await TestDatabase.migrate();
  });
  afterAll(async () => {
    await TestDatabase.close();
  });

  it("should be able to create a new deposit statement", async () => {
    const user = makeUserDto();
    const { body: userBody } = await request(app)
      .post("/api/v1/users")
      .send(user)
      .expect(201);

    const { body: sessionBody } = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: user.email,
        password: user.password,
      });

    const { token, user: userSession } = sessionBody;

    const depositStatementDto = makeDepositStatementDto({
      amount: 500,
      description: "deposit_description",
    });

    const { body: depositStatementBody } = await request(app)
      .post("/api/v1/statements/deposit")
      .set("Authorization", `Bearer ${token}`)
      .send(depositStatementDto);

    expect(depositStatementBody).toEqual(
      expect.objectContaining({
        id: depositStatementBody.id,
        amount: depositStatementDto.amount,
        description: depositStatementDto.description,
        type: "deposit",
        user_id: userSession.id,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      })
    );
  });

  it("should be able to create a new withdraw statement", async () => {
    const user = makeUserDto();
    await request(app).post("/api/v1/users").send(user).expect(201);

    const { body: sessionBody } = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: user.email,
        password: user.password,
      });

    const { token, user: userSession } = sessionBody;

    const depositStatementDto = makeDepositStatementDto({
      amount: 500,
      description: "deposit_description",
    });

    await request(app)
      .post("/api/v1/statements/deposit")
      .set("Authorization", `Bearer ${token}`)
      .send(depositStatementDto);

    const withdrawStatementDto = makeWithdrawStatementDto({
      amount: 200,
      description: "withdraw_description",
    });

    const { body: withdrawStatementBody } = await request(app)
      .post("/api/v1/statements/withdraw")
      .set("Authorization", `Bearer ${token}`)
      .send(withdrawStatementDto);

    expect(withdrawStatementBody).toEqual(
      expect.objectContaining({
        id: withdrawStatementBody.id,
        amount: withdrawStatementDto.amount,
        description: withdrawStatementDto.description,
        type: "withdraw",
        user_id: userSession.id,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      })
    );
  });

  it("should not be able to create a new withdraw statement if user has insufficient funds", async () => {
    const user = makeUserDto();
    await request(app).post("/api/v1/users").send(user).expect(201);
    const expectedError = new CreateStatementError.InsufficientFunds();

    const { body: sessionBody } = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: user.email,
        password: user.password,
      });

    const { token } = sessionBody;

    const withdrawStatementDto = makeWithdrawStatementDto({
      amount: 200,
      description: "withdraw_description",
    });

    const { body: withdrawStatementBody } = await request(app)
      .post("/api/v1/statements/withdraw")
      .set("Authorization", `Bearer ${token}`)
      .send(withdrawStatementDto)
      .expect(expectedError.statusCode);

    expect(withdrawStatementBody).toEqual(
      expect.objectContaining({
        message: expectedError.message,
      })
    );
  });

  it("should not be able to create a new statement if user does not exists", async () => {
    const expectedError = new CreateStatementError.UserNotFound();
    const user = makeUser();
    const { token } = makeJWTToken(user);

    const depositStatementDto = makeDepositStatementDto({
      amount: 500,
      description: "deposit_description",
    });
    const withdrawStatementDto = makeWithdrawStatementDto({
      amount: 500,
      description: "withdraw_description",
    });

    const { body: depositStatementBody } = await request(app)
      .post("/api/v1/statements/deposit")
      .set("Authorization", `Bearer ${token}`)
      .send(depositStatementDto)
      .expect(expectedError.statusCode);

    const { body: withdrawStatementBody } = await request(app)
      .post("/api/v1/statements/withdraw")
      .set("Authorization", `Bearer ${token}`)
      .send(withdrawStatementDto)
      .expect(expectedError.statusCode);

    expect(depositStatementBody).toEqual(
      expect.objectContaining({
        message: expectedError.message,
      })
    );
    expect(withdrawStatementBody).toEqual(
      expect.objectContaining({
        message: expectedError.message,
      })
    );
  });

  it("should not be able to create a new statement if user is not authenticated", async () => {
    const expectedError = new JWTTokenMissingError();

    const depositStatementDto = makeDepositStatementDto({
      amount: 500,
      description: "deposit_description",
    });

    const { body: depositStatementBody } = await request(app)
      .post("/api/v1/statements/deposit")
      .send(depositStatementDto)
      .expect(expectedError.statusCode);

    expect(depositStatementBody).toEqual(
      expect.objectContaining({
        message: expectedError.message,
      })
    );
  });
});
