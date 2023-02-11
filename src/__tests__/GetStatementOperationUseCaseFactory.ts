import { InMemoryStatementsRepository } from "../modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../modules/statements/repositories/IStatementsRepository";
import { GetStatementOperationUseCase } from "../modules/statements/useCases/getStatementOperation/GetStatementOperationUseCase";
import { InMemoryUsersRepository } from "../modules/users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../modules/users/repositories/IUsersRepository";

type GetStatementOperationUseCaseConstructor = {
  usersRepository: IUsersRepository;
  statementsRepository: IStatementsRepository;
};

type Override = Partial<GetStatementOperationUseCaseConstructor>;

export function makeGetStatementOperationUseCase({
  statementsRepository,
  usersRepository,
}: Override = {}) {
  const _usersRepository = usersRepository || new InMemoryUsersRepository();
  const _statementsRepository =
    statementsRepository || new InMemoryStatementsRepository();
  const getStatementOperationUseCase = new GetStatementOperationUseCase(
    _usersRepository,
    _statementsRepository
  );

  return {
    getStatementOperationUseCase,
    usersRepository: _usersRepository,
    statementsRepository: _statementsRepository,
  };
}
