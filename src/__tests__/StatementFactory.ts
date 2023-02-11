import { v4 as uuidv4 } from "uuid";
import { OperationType } from "../modules/statements/entities/Statement";
import { ICreateStatementDTO } from "../modules/statements/useCases/createStatement/ICreateStatementDTO";

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

type OverrideStatementTransfer = Omit<OverrideStatement, "type"> &
  Required<Pick<OverrideStatement, "sender_id">>;
export function makeStatementTransferDto(override: OverrideStatementTransfer) {
  return makeStatementDto({ type: OperationType.TRANSFER, ...override });
}
