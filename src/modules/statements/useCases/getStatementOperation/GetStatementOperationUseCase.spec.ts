import { makeCreateStatementUseCase } from "../../../../__tests__/CreateStatementUseCaseFactory";
import { makeCreateUserUseCase } from "../../../../__tests__/CreateUserUseCaseFactory";
import { makeGetBalanceUseCase } from "../../../../__tests__/GetBalanceUseCaseFactory";
import { makeGetStatementOperationUseCase } from "../../../../__tests__/GetStatementOperationUseCaseFactory";
import {
  makeDepositStatementDto,
  makeWithdrawStatementDto,
} from "../../../../__tests__/StatementFactory";
import { makeUserDto } from "../../../../__tests__/UserFactory";
import { Statement } from "../../entities/Statement";
import { GetStatementOperationError } from "./GetStatementOperationError";

const makeSut = () => {
  const {
    getStatementOperationUseCase,
    statementsRepository,
    usersRepository,
  } = makeGetStatementOperationUseCase();
  const { createStatementUseCase } = makeCreateStatementUseCase({
    usersRepository,
    statementsRepository,
  });
  const { getBalanceUseCase } = makeGetBalanceUseCase({
    statementsRepository,
    usersRepository,
  });
  const { createUserUseCase } = makeCreateUserUseCase({ usersRepository });

  return {
    usersRepository,
    statementsRepository,
    createStatementUseCase,
    getBalanceUseCase,
    getStatementOperationUseCase,
    createUserUseCase,
  };
};

describe("GetStatementOperationUseCase", () => {
  it(`should be able to get the statement operation with user and statement identifier`, async () => {
    const {
      usersRepository,
      createStatementUseCase,
      getStatementOperationUseCase,
    } = makeSut();

    const userCreated = await usersRepository.create(makeUserDto());
    const depositStatementDto1 = makeDepositStatementDto({
      amount: 10,
      user_id: userCreated.id!,
    });
    const depositStatementDto2 = makeDepositStatementDto({
      amount: 20,
      user_id: userCreated.id!,
    });
    const withdrawStatementDto1 = makeWithdrawStatementDto({
      amount: 5,
      user_id: userCreated.id!,
    });

    const statement1 = await createStatementUseCase.execute(
      depositStatementDto1
    );
    const statement2 = await createStatementUseCase.execute(
      depositStatementDto2
    );
    const statement3 = await createStatementUseCase.execute(
      withdrawStatementDto1
    );

    const statementOperation1 = await getStatementOperationUseCase.execute({
      user_id: userCreated.id!,
      statement_id: statement1.id!,
    });
    const statementOperation2 = await getStatementOperationUseCase.execute({
      user_id: userCreated.id!,
      statement_id: statement2.id!,
    });
    const statementOperation3 = await getStatementOperationUseCase.execute({
      user_id: userCreated.id!,
      statement_id: statement3.id!,
    });

    expect(statementOperation1).toBeInstanceOf(Statement);
    expect(statementOperation2).toBeInstanceOf(Statement);
    expect(statementOperation3).toBeInstanceOf(Statement);
  });

  it("should not be able to get statement from an non existing user", async () => {
    const { getStatementOperationUseCase, statementsRepository } = makeSut();

    const depositStatementDto = makeDepositStatementDto({
      amount: 10,
      user_id: "any_user_id",
    });

    const statementCreated = await statementsRepository.create(
      depositStatementDto
    );

    await expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "non_existing_user_id",
        statement_id: statementCreated.id!,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get the statement operation if not exist", async () => {
    const { getStatementOperationUseCase, createUserUseCase } = makeSut();

    const userCreated = await createUserUseCase.execute(makeUserDto());

    await expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: userCreated.id!,
        statement_id: "non_existing_statement_id",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });

  it("should not be able to get the statement from other user", async () => {
    const {
      getStatementOperationUseCase,
      statementsRepository,
      createUserUseCase,
    } = makeSut();

    const userCreatedA = await createUserUseCase.execute(makeUserDto());
    const depositStatementDto = makeDepositStatementDto({
      amount: 10,
      user_id: userCreatedA.id!,
    });
    const statementCreatedA = await statementsRepository.create(
      depositStatementDto
    );

    const userCreatedB = await createUserUseCase.execute(
      makeUserDto({
        email: "user_b@email.com",
      })
    );
    await expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: userCreatedB.id!,
        statement_id: statementCreatedA.id!,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
