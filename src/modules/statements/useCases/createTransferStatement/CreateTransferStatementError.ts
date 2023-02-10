import { AppError } from "../../../../shared/errors/AppError";

export namespace CreateTransferStatementError {
  export class InsufficientFunds extends AppError {
    constructor(msg = "Insufficient funds") {
      super(msg, 400);
    }
  }
  export class OperationForbidden extends AppError {
    constructor(msg = "Operation forbidden") {
      super(msg, 401);
    }
  }

  export class UserNotFound extends AppError {
    constructor(msg = "User not found") {
      super(msg, 404);
    }
  }

  export class StatementNotFound extends AppError {
    constructor(msg = "Statement not found") {
      super(msg, 404);
    }
  }
}
