import { CreateUserError } from "./CreateUserError";
import request from "supertest";
import { app } from "../../../../app";
import { TestDatabase } from "../../../../__tests__/TestDbConnection";
import { makeUserDto } from "../../../../__tests__/UserFactory";

describe("CreateUserController", () => {
  beforeEach(async () => {
    await TestDatabase.create();
    await TestDatabase.drop();
    await TestDatabase.migrate();
  });

  afterAll(async () => {
    await TestDatabase.close();
  });

  it("should be able to create new users", async () => {
    const userDto = makeUserDto();

    await request(app).post("/api/v1/users").send(userDto).expect(201);
  });

  it("should not be able to create new users when email is already taken", async () => {
    const userDto = makeUserDto();
    const expectedError = new CreateUserError();
    await request(app).post("/api/v1/users").send(userDto).expect(201);

    const response = await request(app)
      .post("/api/v1/users")
      .send(userDto)
      .expect(expectedError.statusCode);

    expect(response.body).toEqual(
      expect.objectContaining({
        message: expectedError.message,
      })
    );
  });
});
