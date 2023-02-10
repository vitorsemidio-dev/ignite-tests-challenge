import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateTransferStatementError } from "./CreateTransferStatementError";
import { ICreateTransferStatementDTO } from "./ICreateTransferStatementDTO";

@injectable()
export class CreateTransferStatementUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    amount,
    description,
    receiver_id,
    sender_id,
  }: ICreateTransferStatementDTO): Promise<void> {
    const sender = await this.usersRepository.findById(sender_id);

    if (sender_id === receiver_id) {
      throw new CreateTransferStatementError.OperationForbidden(
        "You can't transfer to yourself"
      );
    }

    if (!sender) {
      throw new CreateTransferStatementError.UserNotFound("Sender not found");
    }

    const receiver = await this.usersRepository.findById(receiver_id);

    if (!receiver) {
      throw new CreateTransferStatementError.UserNotFound("Receiver not found");
    }

    const { balance } = await this.statementsRepository.getUserBalance({
      user_id: sender_id,
    });

    if (balance < amount) {
      throw new CreateTransferStatementError.InsufficientFunds(
        "Insufficient funds"
      );
    }

    await this.statementsRepository.create({
      user_id: sender_id,
      sender_id,
      type: OperationType.TRANSFER,
      amount,
      description,
    });

    await this.statementsRepository.create({
      user_id: receiver_id,
      sender_id,
      type: OperationType.TRANSFER,
      amount,
      description,
    });
  }
}
