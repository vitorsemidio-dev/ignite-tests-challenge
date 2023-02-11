import { InMemoryStatementsRepository } from "../modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../modules/statements/repositories/IStatementsRepository";
import { GetBalanceUseCase } from "../modules/statements/useCases/getBalance/GetBalanceUseCase";
import { InMemoryUsersRepository } from "../modules/users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../modules/users/repositories/IUsersRepository";

type GetBalanceUseCaseConstructor = {
  statementsRepository: IStatementsRepository;
  usersRepository: IUsersRepository;
};

type Override = Partial<GetBalanceUseCaseConstructor>;

export function makeGetBalanceUseCase({
  statementsRepository,
  usersRepository,
}: Override = {}) {
  const _usersRepository = usersRepository || new InMemoryUsersRepository();
  const _statementsRepository =
    statementsRepository || new InMemoryStatementsRepository();
  const getBalanceUseCase = new GetBalanceUseCase(
    _statementsRepository,
    _usersRepository
  );

  return {
    getBalanceUseCase,
    usersRepository: _usersRepository,
    statementsRepository: _statementsRepository,
  };
}
