import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateTransferStatementUseCase } from "./CreateTransferStatementUseCase";
import { ICreateTransferStatementDTO } from "./ICreateTransferStatementDTO";
import { v4 as uuidv4 } from "uuid";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { CreateTransferStatementError } from "./CreateTransferStatementError";

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

  const makeTransferStatementDto = ({
    amount,
    description,
    receiver_id,
    sender_id,
  }: ICreateTransferStatementDTO) => ({
    amount: amount,
    description: description,
    type: OperationType.TRANSFER,
    receiver_id: receiver_id,
    sender_id: sender_id,
  });

  return {
    makeUserDto,
    makeStatementDto,
    makeTransferStatementDto,
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
    const { makeTransferStatementDto, makeStatementDto, makeUserDto } =
      makeDTO();

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
      makeStatementDto({
        amount: 1,
        description: "any_description",
        type: OperationType.DEPOSIT,
        user_id: userSender.id!,
      })
    );

    const transferStatementDto = makeTransferStatementDto({
      amount: 1,
      description: "any_description",
      sender_id: userSender.id!,
      receiver_id: userReceiver.id!,
    });

    await createTransferStatmentUseCase.execute(transferStatementDto);
  });

  it(`should not be able to create new statements with type '${OperationType.TRANSFER}' with insufficient funds`, async () => {
    const { usersRepository, createTransferStatmentUseCase } = makeSut();
    const { makeTransferStatementDto, makeUserDto } = makeDTO();

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

    const transferStatementDto = makeTransferStatementDto({
      amount: 1,
      description: "any_description",
      sender_id: userSender.id!,
      receiver_id: userReceiver.id!,
    });

    await expect(async () => {
      await createTransferStatmentUseCase.execute(transferStatementDto);
    }).rejects.toBeInstanceOf(CreateTransferStatementError.InsufficientFunds);
  });
  it(`should not be able to create new statements with type '${OperationType.TRANSFER}' to non-exists user`, async () => {
    const { usersRepository, createTransferStatmentUseCase } = makeSut();
    const { makeTransferStatementDto, makeUserDto } = makeDTO();

    const userSender = await usersRepository.create(
      makeUserDto({
        email: "sender@email.com",
        name: "sender",
        password: "12345678",
      })
    );

    const transferStatementDto = makeTransferStatementDto({
      amount: 1,
      description: "any_description",
      sender_id: userSender.id!,
      receiver_id: uuidv4(),
    });

    await expect(async () => {
      await createTransferStatmentUseCase.execute(transferStatementDto);
    }).rejects.toBeInstanceOf(CreateTransferStatementError.UserNotFound);
  });

  it(`should not be able to create new statements with type '${OperationType.TRANSFER}' to yourself`, async () => {
    const { usersRepository, createTransferStatmentUseCase } = makeSut();
    const { makeTransferStatementDto, makeUserDto } = makeDTO();

    const userSender = await usersRepository.create(
      makeUserDto({
        email: "sender@email.com",
        name: "sender",
        password: "12345678",
      })
    );

    const transferStatementDto = makeTransferStatementDto({
      amount: 1,
      description: "any_description",
      sender_id: userSender.id!,
      receiver_id: userSender.id!,
    });

    await expect(async () => {
      await createTransferStatmentUseCase.execute(transferStatementDto);
    }).rejects.toBeInstanceOf(CreateTransferStatementError.OperationForbidden);
  });
});
