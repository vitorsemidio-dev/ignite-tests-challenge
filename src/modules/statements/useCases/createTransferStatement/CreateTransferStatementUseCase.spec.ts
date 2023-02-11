import { v4 as uuidv4 } from "uuid";
import {
  makeStatementDepositDto,
  makeStatementTransferDto,
} from "../../../../__tests__/StatementFactory";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateTransferStatementError } from "./CreateTransferStatementError";
import { CreateTransferStatementUseCase } from "./CreateTransferStatementUseCase";

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
  const createTransferStatmentUseCase = new CreateTransferStatementUseCase(
    usersRepository,
    statementsRepository
  );

  return {
    usersRepository,
    statementsRepository,
    createTransferStatmentUseCase,
  };
};

describe("CreateTransferStatementUseCase", () => {
  it(`should be able to create new statements with type '${OperationType.TRANSFER}'`, async () => {
    const {
      usersRepository,
      statementsRepository,
      createTransferStatmentUseCase,
    } = makeSut();
    const { makeUserDto } = makeDTO();

    const userSender = await usersRepository.create(
      makeUserDto({
        email: "sender@email.com",
        name: "sender",
        password: "12345678",
      })
    );
    const userReceiver = await usersRepository.create(
      makeUserDto({
        email: "receiver@email.com",
        name: "receiver",
        password: "12345678",
      })
    );
    await statementsRepository.create(
      makeStatementDepositDto({
        amount: 1000,
        user_id: userSender.id!,
      })
    );

    const transferStatementDto = makeStatementTransferDto({
      amount: 100,
      sender_id: userSender.id!,
      receiver_id: userReceiver.id!,
    });

    await createTransferStatmentUseCase.execute(transferStatementDto);
  });

  it(`should not be able to create new statements with type '${OperationType.TRANSFER}' with insufficient funds`, async () => {
    const { usersRepository, createTransferStatmentUseCase } = makeSut();
    const { makeUserDto } = makeDTO();

    const userSender = await usersRepository.create(
      makeUserDto({
        email: "sender@email.com",
        name: "sender",
        password: "12345678",
      })
    );
    const userReceiver = await usersRepository.create(
      makeUserDto({
        email: "receiver@email.com",
        name: "receiver",
        password: "12345678",
      })
    );

    const transferStatementDto = makeStatementTransferDto({
      sender_id: userSender.id!,
      receiver_id: userReceiver.id!,
    });

    await expect(async () => {
      await createTransferStatmentUseCase.execute(transferStatementDto);
    }).rejects.toBeInstanceOf(CreateTransferStatementError.InsufficientFunds);
  });
  it(`should not be able to create new statements with type '${OperationType.TRANSFER}' to non-exists user`, async () => {
    const { usersRepository, createTransferStatmentUseCase } = makeSut();
    const { makeUserDto } = makeDTO();

    const userSender = await usersRepository.create(
      makeUserDto({
        email: "sender@email.com",
        name: "sender",
        password: "12345678",
      })
    );

    const transferStatementDto = makeStatementTransferDto({
      sender_id: userSender.id!,
      receiver_id: uuidv4(),
    });

    await expect(async () => {
      await createTransferStatmentUseCase.execute(transferStatementDto);
    }).rejects.toBeInstanceOf(CreateTransferStatementError.UserNotFound);
  });

  it(`should not be able to create new statements with type '${OperationType.TRANSFER}' to yourself`, async () => {
    const { usersRepository, createTransferStatmentUseCase } = makeSut();
    const { makeUserDto } = makeDTO();

    const userSender = await usersRepository.create(
      makeUserDto({
        email: "sender@email.com",
        name: "sender",
        password: "12345678",
      })
    );

    const transferStatementDto = makeStatementTransferDto({
      sender_id: userSender.id!,
      receiver_id: userSender.id!,
    });

    await expect(async () => {
      await createTransferStatmentUseCase.execute(transferStatementDto);
    }).rejects.toBeInstanceOf(CreateTransferStatementError.OperationForbidden);
  });
});
