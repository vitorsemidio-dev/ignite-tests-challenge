import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType, Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { InMemoryUsersRepository } from "./../../../users/repositories/in-memory/InMemoryUsersRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

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
  }: Partial<ICreateUserDTO> = userDefault) => ({
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
  const getStatementOperationUseCase = new GetStatementOperationUseCase(
    usersRepository,
    statementsRepository
  );
  const createUserUseCase = new CreateUserUseCase(usersRepository);

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
    const { makeStatementDto } = makeDTO();

    const depositStatementDto = makeStatementDto({
      amount: 10,
      description: "any_description",
      type: OperationType.DEPOSIT,
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
    const { makeUserDto } = makeDTO();

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
    const { makeStatementDto, makeUserDto } = makeDTO();

    const userCreatedA = await createUserUseCase.execute(makeUserDto());
    const depositStatementDto = makeStatementDto({
      amount: 10,
      description: "any_description",
      type: OperationType.DEPOSIT,
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
