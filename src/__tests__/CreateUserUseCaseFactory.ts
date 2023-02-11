import { InMemoryUsersRepository } from "../modules/users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../modules/users/repositories/IUsersRepository";
import { CreateUserUseCase } from "../modules/users/useCases/createUser/CreateUserUseCase";

type CreateUserUseCaseConstructor = {
  usersRepository: IUsersRepository;
};

type Override = Partial<CreateUserUseCaseConstructor>;

export function makeCreateUserUseCase({ usersRepository }: Override = {}) {
  const _usersRepository = usersRepository || new InMemoryUsersRepository();
  const createUserUseCase = new CreateUserUseCase(_usersRepository);

  return {
    createUserUseCase,
    usersRepository: _usersRepository,
  };
}
