import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType, Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "./../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

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

  return {
    usersRepository,
    statementsRepository,
    createStatementUseCase,
  };
};

describe("CreateStatementUseCase", () => {
  it(`should be able to create new statements with type '${OperationType.DEPOSIT}'`, async () => {
    const { usersRepository, createStatementUseCase } = makeSut();
    const { makeStatementDto, makeUserDto } = makeDTO();

    const userCreated = await usersRepository.create(makeUserDto());
    const depositStatementDto = makeStatementDto({
      amount: 1,
      description: "any_description",
      type: OperationType.DEPOSIT,
      user_id: userCreated.id!,
    });

    const statement = await createStatementUseCase.execute(depositStatementDto);

    expect(statement).toBeInstanceOf(Statement);
    expect(statement).toMatchObject({
      id: statement.id,
      type: depositStatementDto.type,
      user_id: depositStatementDto.user_id,
      description: depositStatementDto.description,
      amount: depositStatementDto.amount,
    });
  });

  it(`should be able to create new statements with type '${OperationType.WITHDRAW}'`, async () => {
    const { usersRepository, createStatementUseCase } = makeSut();
    const { makeStatementDto, makeUserDto } = makeDTO();

    const userCreated = await usersRepository.create(makeUserDto());
    const depositStatementDto = makeStatementDto({
      amount: 1000,
      description: "any_description",
      type: OperationType.DEPOSIT,
      user_id: userCreated.id!,
    });
    const withdrawStatementDto = makeStatementDto({
      amount: 1,
      description: "any_description",
      type: OperationType.WITHDRAW,
      user_id: userCreated.id!,
    });

    await createStatementUseCase.execute(depositStatementDto);
    const withdrawStatement = await createStatementUseCase.execute(
      withdrawStatementDto
    );

    expect(withdrawStatement).toBeInstanceOf(Statement);
    expect(withdrawStatement).toMatchObject({
      id: withdrawStatement.id,
      type: withdrawStatementDto.type,
      user_id: withdrawStatementDto.user_id,
      description: withdrawStatementDto.description,
      amount: withdrawStatementDto.amount,
    });
  });

  it(`should not be able to ${OperationType.WITHDRAW} if user does not exist`, async () => {
    const { createStatementUseCase } = makeSut();
    const { makeStatementDto } = makeDTO();

    const withdrawStatementDto = makeStatementDto({
      amount: 1,
      description: "any_description",
      type: OperationType.WITHDRAW,
      user_id: "any_user_id",
    });

    await expect(async () => {
      await createStatementUseCase.execute(withdrawStatementDto);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it(`should not be able to ${OperationType.DEPOSIT} if user does not exist`, async () => {
    const { createStatementUseCase } = makeSut();
    const { makeStatementDto } = makeDTO();

    const depositStatementDto = makeStatementDto({
      amount: 1,
      description: "any_description",
      type: OperationType.DEPOSIT,
      user_id: "any_user_id",
    });

    await expect(async () => {
      await createStatementUseCase.execute(depositStatementDto);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it(`should not be able to '${OperationType.WITHDRAW}' if user has no sufficient funds`, async () => {
    const { usersRepository, createStatementUseCase } = makeSut();
    const { makeStatementDto, makeUserDto } = makeDTO();

    const userCreated = await usersRepository.create(makeUserDto());
    const depositStatementDto = makeStatementDto({
      amount: 1,
      description: "any_description",
      type: OperationType.DEPOSIT,
      user_id: userCreated.id!,
    });
    const withdrawStatementDto = makeStatementDto({
      amount: 1000,
      description: "any_description",
      type: OperationType.WITHDRAW,
      user_id: userCreated.id!,
    });

    await createStatementUseCase.execute(depositStatementDto);

    await expect(async () => {
      await createStatementUseCase.execute(withdrawStatementDto);
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
