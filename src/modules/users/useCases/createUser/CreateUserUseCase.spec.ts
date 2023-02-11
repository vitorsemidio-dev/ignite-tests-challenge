import { makeCreateUserUseCase } from "../../../../__tests__/CreateUserUseCaseFactory";
import { makeUserDto } from "../../../../__tests__/UserFactory";
import { CreateUserError } from "./CreateUserError";

const makeSut = () => {
  const { createUserUseCase, usersRepository } = makeCreateUserUseCase();

  return {
    usersRepository,
    createUserUseCase,
  };
};

describe("CreateUserUseCase", () => {
  it("should be able to create new users", async () => {
    const { createUserUseCase } = makeSut();
    const user = await createUserUseCase.execute(makeUserDto());

    expect(user).toHaveProperty("id");
  });

  it("should not be able to create new users when email is already taken", async () => {
    const { createUserUseCase } = makeSut();
    const user = await createUserUseCase.execute(makeUserDto());
    const userWithSameEmail = makeUserDto({
      email: user.email,
      name: "any_name",
      password: "any_password",
    });

    await expect(async () => {
      await createUserUseCase.execute(userWithSameEmail);
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
