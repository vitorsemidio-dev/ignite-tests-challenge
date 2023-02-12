import request from "supertest";
import { app } from "../../../../app";
import { TestDatabase } from "../../../../__tests__/TestDbConnection";
import { makeUserDto } from "../../../../__tests__/UserFactory";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

describe("AuthenticateUserController", () => {
  beforeEach(async () => {
    await TestDatabase.create();
    await TestDatabase.drop();
    await TestDatabase.migrate();
  });
  afterAll(async () => {
    await TestDatabase.close();
  });

  it("should be able to authenticate an user", async () => {
    const user = makeUserDto();
    await request(app).post("/api/v1/users").send(user).expect(201);

    const { body } = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password,
    });

    expect(body).toHaveProperty("user");
    expect(body).toHaveProperty("token");
  });

  it("should not be able to authenticate an nonexistent user", async () => {
    const user = makeUserDto({
      email: "nonexistent@email.com",
      password: "nonexistent_password",
    });
    const expectedError = new IncorrectEmailOrPasswordError();

    const { body } = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: user.email,
        password: user.password,
      })
      .expect(expectedError.statusCode);

    expect(body).toEqual(
      expect.objectContaining({
        message: expectedError.message,
      })
    );
  });

  it("should not be able to authenticate with incorrect password", async () => {
    const user = makeUserDto({
      email: "any_correct_email@email.com",
      password: "correct_password",
    });
    const expectedError = new IncorrectEmailOrPasswordError();

    await request(app).post("/api/v1/users").send(user).expect(201);

    const { body } = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: user.email,
        password: "incorrect_password",
      })
      .expect(expectedError.statusCode);

    expect(body).toEqual(
      expect.objectContaining({
        message: expectedError.message,
      })
    );
  });

  it("should not be able to authenticate with incorrect email", async () => {
    const user = makeUserDto({
      email: "correct_email@email.com",
    });
    const expectedError = new IncorrectEmailOrPasswordError();

    await request(app).post("/api/v1/users").send(user).expect(201);

    const { body } = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "incorrect_email@email.com",
        password: user.password,
      })
      .expect(expectedError.statusCode);

    expect(body).toEqual(
      expect.objectContaining({
        message: expectedError.message,
      })
    );
  });
});
