import { InMemoryUsersRepository } from "../modules/users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../modules/users/repositories/IUsersRepository";
import { ShowUserProfileUseCase } from "../modules/users/useCases/showUserProfile/ShowUserProfileUseCase";

type ShowUserProfileUseCaseConstructor = {
  usersRepository: IUsersRepository;
};

type Override = Partial<ShowUserProfileUseCaseConstructor>;

export function makeShowUserProfileUseCase({ usersRepository }: Override = {}) {
  const _usersRepository = usersRepository || new InMemoryUsersRepository();
  const showUserProfileUseCase = new ShowUserProfileUseCase(_usersRepository);

  return {
    showUserProfileUseCase,
    usersRepository: _usersRepository,
  };
}
