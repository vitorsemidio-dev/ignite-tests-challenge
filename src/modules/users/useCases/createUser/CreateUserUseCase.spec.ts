import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

const makeSut = () => {
  const usersRepository = new InMemoryUsersRepository();
  const createUserUseCase = new CreateUserUseCase(usersRepository);
  const createUserDto: ICreateUserDTO = {
    email: "test@email.com",
    name: "test",
    password: "test",
  };

  return {
    usersRepository,
    createUserUseCase,
    createUserDto,
  };
};

describe("CreateUserUseCase", () => {
  it("should be able to create new users", async () => {
    const { createUserDto, createUserUseCase } = makeSut();
    const user = await createUserUseCase.execute(createUserDto);

    expect(user).toHaveProperty("id");
  });

  it("should not be able to create new users when email is already taken", async () => {
    const { createUserDto, createUserUseCase } = makeSut();
    await expect(async () => {
      await createUserUseCase.execute(createUserDto);
      createUserDto.name = "any_name";
      createUserDto.password = "any_password";
      await createUserUseCase.execute(createUserDto);
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
