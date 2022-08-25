import { ShowUserProfileError } from "./ShowUserProfileError";
import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

const makeSut = () => {
  const usersRepository = new InMemoryUsersRepository();
  const showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
  const createUserDto: ICreateUserDTO = {
    email: "test@email.com",
    name: "test",
    password: "test",
  };

  return {
    usersRepository,
    showUserProfileUseCase,
    createUserDto,
  };
};

describe("ShowUserProfileError", () => {
  it("should be able to show user profile", async () => {
    const { createUserDto, showUserProfileUseCase, usersRepository } =
      makeSut();
    const userCreated = await usersRepository.create(createUserDto);

    const user = await showUserProfileUseCase.execute(userCreated.id!);

    expect(user).toBeTruthy();
    expect(user).toBeInstanceOf(User);
    expect(user.name).toEqual(createUserDto.name);
    expect(user.email).toEqual(createUserDto.email);
  });

  it("should not be able to show user profile when user does not exists", async () => {
    const { showUserProfileUseCase } = makeSut();
    await expect(async () => {
      await showUserProfileUseCase.execute("non_existing_user_id");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
