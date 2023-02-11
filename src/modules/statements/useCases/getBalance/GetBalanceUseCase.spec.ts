import { makeCreateStatementUseCase } from "../../../../__tests__/CreateStatementUseCaseFactory";
import { makeGetBalanceUseCase } from "../../../../__tests__/GetBalanceUseCaseFactory";
import {
  makeDepositStatementDto,
  makeWithdrawStatementDto,
} from "../../../../__tests__/StatementFactory";
import { makeUserDto } from "../../../../__tests__/UserFactory";
import { GetBalanceError } from "./GetBalanceError";

const makeSut = () => {
  const { createStatementUseCase, statementsRepository, usersRepository } =
    makeCreateStatementUseCase();
  const { getBalanceUseCase } = makeGetBalanceUseCase({
    statementsRepository,
    usersRepository,
  });

  return {
    usersRepository,
    statementsRepository,
    createStatementUseCase,
    getBalanceUseCase,
  };
};

describe("GetBalanceUseCase", () => {
  it(`should be able to get the balance`, async () => {
    const { usersRepository, createStatementUseCase, getBalanceUseCase } =
      makeSut();

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

    const balance = await getBalanceUseCase.execute({
      user_id: userCreated.id!,
    });

    expect(balance).toBeTruthy();
    expect(balance).toHaveProperty("statement");
    expect(balance).toHaveProperty("balance");
    expect(balance.balance).toBe(25);
    expect(balance.statement).toMatchObject([
      statement1,
      statement2,
      statement3,
    ]);
  });

  it("should not be able to get the balance from an non existing user", async () => {
    const { getBalanceUseCase } = makeSut();

    await expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "any_user_id",
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
