import request from "supertest";
import { app } from "../../../../app";
import { TestDatabase } from "../../../../__tests__/TestDbConnection";
import { makeJWTToken } from "../../../../__tests__/TokenFactory";
import { makeUser, makeUserDto } from "../../../../__tests__/UserFactory";
import { ShowUserProfileError } from "./ShowUserProfileError";

describe("ShowUserProfileController", () => {
  beforeEach(async () => {
    await TestDatabase.create();
    await TestDatabase.drop();
    await TestDatabase.migrate();
  });

  afterAll(async () => {
    await TestDatabase.close();
  });

  it("should be able to show user profile", async () => {
    const userDto = makeUserDto();
    await request(app).post("/api/v1/users").send(userDto).expect(201);
    const session = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: userDto.email,
        password: userDto.password,
      })
      .expect(200);
    const userProfile = await request(app)
      .get("/api/v1/profile")
      .set("Authorization", `Bearer ${session.body.token}`);

    expect(userProfile.status).toBe(200);
    expect(userProfile.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: userDto.name,
        email: userDto.email,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      })
    );
  });

  it("should not be able to show user profile when user does not exists", async () => {
    const user = makeUser();
    const { token } = makeJWTToken(user);
    const expectedError = new ShowUserProfileError();

    const userProfile = await request(app)
      .get("/api/v1/profile")
      .set("Authorization", `Bearer ${token}`)
      .expect(expectedError.statusCode);

    expect(userProfile.body).toEqual(
      expect.objectContaining({
        message: expectedError.message,
      })
    );
  });
});
