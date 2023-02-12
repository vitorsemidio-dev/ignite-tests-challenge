import request from "supertest";
import { app } from "../../../../app";
import { TestDatabase } from "../../../../__tests__/TestDbConnection";
import { makeJWTToken } from "../../../../__tests__/TokenFactory";
import { makeE2EUser, makeUser } from "../../../../__tests__/UserFactory";
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
    const { token, user } = await makeE2EUser(request(app));

    const userProfile = await request(app)
      .get("/api/v1/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(userProfile.status).toBe(200);
    expect(userProfile.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: user.name,
        email: user.email,
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
