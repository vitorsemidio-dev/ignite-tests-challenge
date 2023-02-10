import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferStatementUseCase } from "./CreateTransferStatementUseCase";

export class CreateTransferStatementController {
  async execute(request: Request, response: Response) {
    const { id: sender_id } = request.user;
    const { user_id: receiver_id } = request.params;
    const { amount, description } = request.body;

    const createTransferStatementUseCase = container.resolve(
      CreateTransferStatementUseCase
    );
    await createTransferStatementUseCase.execute({
      amount,
      description,
      receiver_id,
      sender_id,
    });

    return response.status(201).json();
  }
}
