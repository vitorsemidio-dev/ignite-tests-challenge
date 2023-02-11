import { v4 as uuidv4 } from "uuid";
import { OperationType } from "../modules/statements/entities/Statement";
import { ICreateStatementDTO } from "../modules/statements/useCases/createStatement/ICreateStatementDTO";
import { ICreateTransferStatementDTO } from "../modules/statements/useCases/createTransferStatement/ICreateTransferStatementDTO";

type OverrideStatement = Partial<ICreateStatementDTO> &
  Pick<ICreateStatementDTO, "type">;

export function makeStatementDto(override: OverrideStatement) {
  return {
    amount: 100,
    description: "any_description",
    user_id: uuidv4(),
    ...override,
  };
}

type OverrideStatementDeposit = Omit<OverrideStatement, "type">;

export function makeStatementDepositDto(
  override: OverrideStatementDeposit = {}
) {
  return makeStatementDto({ type: OperationType.DEPOSIT, ...override });
}

type OverrideStatementWithdraw = Omit<OverrideStatement, "type">;
export function makeStatementWithdrawDto(
  override: OverrideStatementWithdraw = {}
) {
  return makeStatementDto({ type: OperationType.WITHDRAW, ...override });
}

type OverrideStatementTransfer = Partial<ICreateTransferStatementDTO>;
export function makeStatementTransferDto(override: OverrideStatementTransfer) {
  return {
    amount: 100,
    description: "any_description",
    receiver_id: uuidv4(),
    sender_id: uuidv4(),
    ...override,
  };
}
