import request from "supertest";
import { app } from "../../../../app";
import { TestDatabase } from "../../../../__tests__/TestDbConnection";

describe("ShowUserProfileController", () => {
  beforeEach(async () => {
    await TestDatabase.create();
    await TestDatabase.drop();
    await TestDatabase.migrate();
  });

  afterEach(async () => {
    await TestDatabase.close();
  });

  it("should be able to show user profile", async () => {
    const userProfile = await request(app).get("/api/v1/profile");
    expect(1).toBe(1);
    expect(userProfile.status).toBe(200);
  });
});
