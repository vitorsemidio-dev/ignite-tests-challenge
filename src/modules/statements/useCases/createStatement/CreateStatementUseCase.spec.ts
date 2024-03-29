import { makeCreateStatementUseCase } from "../../../../__tests__/CreateStatementUseCaseFactory";
import {
  makeDepositStatementDto,
  makeWithdrawStatementDto,
} from "../../../../__tests__/StatementFactory";
import { makeUserDto } from "../../../../__tests__/UserFactory";
import { OperationType, Statement } from "../../entities/Statement";
import { CreateStatementError } from "./CreateStatementError";

const makeSut = () => {
  const { createStatementUseCase, statementsRepository, usersRepository } =
    makeCreateStatementUseCase();

  return {
    usersRepository,
    statementsRepository,
    createStatementUseCase,
  };
};

describe("CreateStatementUseCase", () => {
  it(`should be able to create new statements with type '${OperationType.DEPOSIT}'`, async () => {
    const { usersRepository, createStatementUseCase } = makeSut();

    const userCreated = await usersRepository.create(makeUserDto());
    const depositStatementDto = makeDepositStatementDto({
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

    const userCreated = await usersRepository.create(makeUserDto());
    const depositStatementDto = makeDepositStatementDto({
      amount: 1000,
      user_id: userCreated.id!,
    });
    const withdrawStatementDto = makeWithdrawStatementDto({
      amount: 1,
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

    const withdrawStatementDto = makeWithdrawStatementDto({
      user_id: "any_user_id",
    });

    await expect(async () => {
      await createStatementUseCase.execute(withdrawStatementDto);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it(`should not be able to ${OperationType.DEPOSIT} if user does not exist`, async () => {
    const { createStatementUseCase } = makeSut();

    const depositStatementDto = makeDepositStatementDto({
      user_id: "any_user_id",
    });

    await expect(async () => {
      await createStatementUseCase.execute(depositStatementDto);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it(`should not be able to '${OperationType.WITHDRAW}' if user has no sufficient funds`, async () => {
    const { usersRepository, createStatementUseCase } = makeSut();

    const userCreated = await usersRepository.create(makeUserDto());
    const depositStatementDto = makeDepositStatementDto({
      amount: 1,
      user_id: userCreated.id!,
    });
    const withdrawStatementDto = makeWithdrawStatementDto({
      amount: 1000,
      user_id: userCreated.id!,
    });

    await createStatementUseCase.execute(depositStatementDto);

    await expect(async () => {
      await createStatementUseCase.execute(withdrawStatementDto);
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
