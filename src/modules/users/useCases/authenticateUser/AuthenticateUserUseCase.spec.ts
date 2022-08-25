import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

const makeSut = () => {
  const usersRepository = new InMemoryUsersRepository();
  const authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
  const createUserUseCase = new CreateUserUseCase(usersRepository);
  const createUserDto: ICreateUserDTO = {
    email: "test@email.com",
    name: "test",
    password: "test",
  };

  return {
    usersRepository,
    authenticateUserUseCase,
    createUserDto,
    createUserUseCase,
  };
};

describe("AuthenticateUserUseCase", () => {
  it("should be able to authenticate an user", async () => {
    const { createUserDto, authenticateUserUseCase, createUserUseCase } =
      makeSut();
    const userCreated = await createUserUseCase.execute(createUserDto);

    const authPayload = await authenticateUserUseCase.execute({
      email: createUserDto.email,
      password: createUserDto.password,
    });

    expect(authPayload).toMatchObject({
      user: {
        id: userCreated.id,
        name: userCreated.name,
        email: userCreated.email,
      },
      token: authPayload.token,
    });
  });

  it("should not be able to authenticate an user if not exists", async () => {
    const { authenticateUserUseCase, createUserDto } = makeSut();
    await expect(async () => {
      await authenticateUserUseCase.execute({
        email: createUserDto.email,
        password: createUserDto.password,
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate an user if wrong password is provided", async () => {
    const { authenticateUserUseCase, createUserDto, createUserUseCase } =
      makeSut();
    await createUserUseCase.execute(createUserDto);
    await expect(async () => {
      await authenticateUserUseCase.execute({
        email: createUserDto.email,
        password: "wrong password",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate an user if wrong e-mail is provided", async () => {
    const { authenticateUserUseCase, createUserDto, createUserUseCase } =
      makeSut();
    await createUserUseCase.execute(createUserDto);
    await expect(async () => {
      await authenticateUserUseCase.execute({
        email: "wrong-email@email.com",
        password: createUserDto.password,
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
