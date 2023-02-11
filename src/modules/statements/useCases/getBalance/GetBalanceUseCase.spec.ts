import {
  makeDepositStatementDto,
  makeWithdrawStatementDto,
} from "../../../../__tests__/StatementFactory";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { InMemoryUsersRepository } from "./../../../users/repositories/in-memory/InMemoryUsersRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

const makeDTO = () => {
  const userDefault = {
    email: "test@email.com",
    name: "test",
    password: "test",
  };
  const makeUserDto = ({
    email,
    name,
    password,
  }: ICreateUserDTO = userDefault) => ({
    email: email || userDefault.email,
    name: name || userDefault.name,
    password: password || userDefault.password,
  });

  return {
    makeUserDto,
  };
};

const makeSut = () => {
  const usersRepository = new InMemoryUsersRepository();
  const statementsRepository = new InMemoryStatementsRepository();
  const createStatementUseCase = new CreateStatementUseCase(
    usersRepository,
    statementsRepository
  );
  const getBalanceUseCase = new GetBalanceUseCase(
    statementsRepository,
    usersRepository
  );

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
    const { makeUserDto } = makeDTO();

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
