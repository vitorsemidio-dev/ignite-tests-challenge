import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
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

  const makeStatementDto = ({
    amount,
    description,
    type,
    user_id,
  }: ICreateStatementDTO) => ({
    amount: amount,
    description: description,
    type: type,
    user_id: user_id,
  });

  return {
    makeUserDto,
    makeStatementDto,
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
    const { makeStatementDto, makeUserDto } = makeDTO();

    const userCreated = await usersRepository.create(makeUserDto());
    const depositStatementDto1 = makeStatementDto({
      amount: 10,
      description: "any_description",
      type: OperationType.DEPOSIT,
      user_id: userCreated.id!,
    });
    const depositStatementDto2 = makeStatementDto({
      amount: 20,
      description: "any_description",
      type: OperationType.DEPOSIT,
      user_id: userCreated.id!,
    });
    const withdrawStatementDto1 = makeStatementDto({
      amount: 5,
      description: "any_description",
      type: OperationType.WITHDRAW,
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
