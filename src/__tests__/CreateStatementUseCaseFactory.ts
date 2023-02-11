import { InMemoryStatementsRepository } from "../modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../modules/statements/repositories/IStatementsRepository";
import { CreateStatementUseCase } from "../modules/statements/useCases/createStatement/CreateStatementUseCase";
import { InMemoryUsersRepository } from "../modules/users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../modules/users/repositories/IUsersRepository";

type CreateStatementUseCaseConstructor = {
  usersRepository: IUsersRepository;
  statementsRepository: IStatementsRepository;
};

type Override = Partial<CreateStatementUseCaseConstructor>;

export function makeCreateStatementUseCase({
  statementsRepository,
  usersRepository,
}: Override = {}) {
  const _usersRepository = usersRepository || new InMemoryUsersRepository();
  const _statementsRepository =
    statementsRepository || new InMemoryStatementsRepository();
  const createStatementUseCase = new CreateStatementUseCase(
    _usersRepository,
    _statementsRepository
  );

  return {
    createStatementUseCase,
    usersRepository: _usersRepository,
    statementsRepository: _statementsRepository,
  };
}
