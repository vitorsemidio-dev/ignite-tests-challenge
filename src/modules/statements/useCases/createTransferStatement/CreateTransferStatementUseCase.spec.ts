import { v4 as uuidv4 } from "uuid";
import { makeCreateTransferStatementUseCase } from "../../../../__tests__/CreateTransferStatementUseCaseFactory";
import {
  makeDepositStatementDto,
  makeTransferStatementDto,
} from "../../../../__tests__/StatementFactory";
import { makeUserDto } from "../../../../__tests__/UserFactory";
import { OperationType } from "../../entities/Statement";
import { CreateTransferStatementError } from "./CreateTransferStatementError";

const makeSut = () => {
  const {
    usersRepository,
    statementsRepository,
    createTransferStatementUseCase,
  } = makeCreateTransferStatementUseCase();

  return {
    usersRepository,
    statementsRepository,
    createTransferStatementUseCase,
  };
};

describe("CreateTransferStatementUseCase", () => {
  it(`should be able to create new statements with type '${OperationType.TRANSFER}'`, async () => {
    const {
      usersRepository,
      statementsRepository,
      createTransferStatementUseCase,
    } = makeSut();
    const userSender = await usersRepository.create(
      makeUserDto({
        email: "sender@email.com",
        name: "sender",
      })
    );
    const userReceiver = await usersRepository.create(
      makeUserDto({
        email: "receiver@email.com",
        name: "receiver",
      })
    );
    await statementsRepository.create(
      makeDepositStatementDto({
        amount: 1000,
        user_id: userSender.id!,
      })
    );

    const transferStatementDto = makeTransferStatementDto({
      amount: 100,
      sender_id: userSender.id!,
      receiver_id: userReceiver.id!,
    });

    await createTransferStatementUseCase.execute(transferStatementDto);
  });

  it(`should not be able to create new statements with type '${OperationType.TRANSFER}' with insufficient funds`, async () => {
    const { usersRepository, createTransferStatementUseCase } = makeSut();
    const userSender = await usersRepository.create(
      makeUserDto({
        email: "sender@email.com",
        name: "sender",
      })
    );
    const userReceiver = await usersRepository.create(
      makeUserDto({
        email: "receiver@email.com",
        name: "receiver",
      })
    );

    const transferStatementDto = makeTransferStatementDto({
      sender_id: userSender.id!,
      receiver_id: userReceiver.id!,
    });

    await expect(async () => {
      await createTransferStatementUseCase.execute(transferStatementDto);
    }).rejects.toBeInstanceOf(CreateTransferStatementError.InsufficientFunds);
  });
  it(`should not be able to create new statements with type '${OperationType.TRANSFER}' when receiver not exists`, async () => {
    const { usersRepository, createTransferStatementUseCase } = makeSut();
    const userSender = await usersRepository.create(
      makeUserDto({
        email: "sender@email.com",
        name: "sender",
      })
    );

    const transferStatementDto = makeTransferStatementDto({
      sender_id: userSender.id!,
      receiver_id: uuidv4(),
    });

    await expect(async () => {
      await createTransferStatementUseCase.execute(transferStatementDto);
    }).rejects.toBeInstanceOf(CreateTransferStatementError.UserNotFound);
  });

  it(`should not be able to create new statements with type '${OperationType.TRANSFER}' when sender not exists`, async () => {
    const { usersRepository, createTransferStatementUseCase } = makeSut();
    const userReceiver = await usersRepository.create(
      makeUserDto({
        email: "receiver@email.com",
        name: "receiver",
      })
    );
    const transferStatementDto = makeTransferStatementDto({
      receiver_id: userReceiver.id!,
      sender_id: uuidv4(),
    });

    await expect(async () => {
      await createTransferStatementUseCase.execute(transferStatementDto);
    }).rejects.toBeInstanceOf(CreateTransferStatementError.UserNotFound);
  });

  it(`should not be able to create new statements with type '${OperationType.TRANSFER}' to yourself`, async () => {
    const { usersRepository, createTransferStatementUseCase } = makeSut();
    const userSender = await usersRepository.create(
      makeUserDto({
        email: "sender@email.com",
        name: "sender",
      })
    );

    const transferStatementDto = makeTransferStatementDto({
      sender_id: userSender.id!,
      receiver_id: userSender.id!,
    });

    await expect(async () => {
      await createTransferStatementUseCase.execute(transferStatementDto);
    }).rejects.toBeInstanceOf(CreateTransferStatementError.OperationForbidden);
  });
});
