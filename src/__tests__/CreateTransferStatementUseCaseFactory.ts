import { InMemoryStatementsRepository } from "../modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../modules/statements/repositories/IStatementsRepository";
import { CreateTransferStatementUseCase } from "../modules/statements/useCases/createTransferStatement/CreateTransferStatementUseCase";
import { InMemoryUsersRepository } from "../modules/users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../modules/users/repositories/IUsersRepository";

type CreateTransferStatementUseCaseConstructor = {
  usersRepository: IUsersRepository;
  statementsRepository: IStatementsRepository;
};

type Override = Partial<CreateTransferStatementUseCaseConstructor>;

export function makeCreateTransferStatementUseCase({
  statementsRepository,
  usersRepository,
}: Override = {}) {
  const _usersRepository = usersRepository || new InMemoryUsersRepository();
  const _statementsRepository =
    statementsRepository || new InMemoryStatementsRepository();
  const createTransferStatementUseCase = new CreateTransferStatementUseCase(
    _usersRepository,
    _statementsRepository
  );

  return {
    createTransferStatementUseCase,
    usersRepository: _usersRepository,
    statementsRepository: _statementsRepository,
  };
}
