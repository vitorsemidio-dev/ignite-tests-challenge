import { makeShowUserProfileUseCase } from "../../../../__tests__/ShowUserProfileUseCase";
import { makeUserDto } from "../../../../__tests__/UserFactory";
import { User } from "../../entities/User";
import { ShowUserProfileError } from "./ShowUserProfileError";

const makeSut = () => {
  const { showUserProfileUseCase, usersRepository } =
    makeShowUserProfileUseCase();

  return {
    usersRepository,
    showUserProfileUseCase,
  };
};

describe("ShowUserProfileError", () => {
  it("should be able to show user profile", async () => {
    const { showUserProfileUseCase, usersRepository } = makeSut();
    const createUserDto = makeUserDto();
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
