import { v4 as uuidv4 } from "uuid";
import request from "supertest";
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

export function makeDepositStatementDto(
  override: OverrideStatementDeposit = {}
) {
  return makeStatementDto({ type: OperationType.DEPOSIT, ...override });
}

type OverrideStatementWithdraw = Omit<OverrideStatement, "type">;
export function makeWithdrawStatementDto(
  override: OverrideStatementWithdraw = {}
) {
  return makeStatementDto({ type: OperationType.WITHDRAW, ...override });
}

type OverrideStatementTransfer = Partial<ICreateTransferStatementDTO>;
export function makeTransferStatementDto(override: OverrideStatementTransfer) {
  return {
    amount: 100,
    description: "any_description",
    receiver_id: uuidv4(),
    sender_id: uuidv4(),
    ...override,
  };
}

type AuthE2E = {
  token: string;
};

type OverrideE2EStatement = Partial<
  Omit<ICreateStatementDTO, "type" | "sender_id">
>;

export async function makeE2EDepositStatement(
  appRequest: request.SuperTest<request.Test>,
  overrider: OverrideE2EStatement = {},
  { token }: AuthE2E
) {
  {
    const depositStatementDto = makeDepositStatementDto({
      ...overrider,
    });

    const { body: depositStatementBody } = await appRequest
      .post("/api/v1/statements/deposit")
      .set("Authorization", `Bearer ${token}`)
      .send(depositStatementDto);

    return {
      body: depositStatementBody,
      dto: depositStatementDto,
    };
  }
}

export async function makeE2EWithdrawStatement(
  appRequest: request.SuperTest<request.Test>,
  overrider: OverrideE2EStatement = {},
  { token }: AuthE2E
) {
  {
    const withdrawStatementDto = makeWithdrawStatementDto({
      ...overrider,
    });

    const { body: withdrawStatementBody } = await appRequest
      .post("/api/v1/statements/withdraw")
      .set("Authorization", `Bearer ${token}`)
      .send(withdrawStatementDto);

    return {
      body: withdrawStatementBody,
      dto: withdrawStatementDto,
    };
  }
}

type OverrideE2EStatementTransfer = Partial<ICreateTransferStatementDTO>;

export async function makeE2ETransferStatement(
  appRequest: request.SuperTest<request.Test>,
  overrider: OverrideE2EStatementTransfer = {},
  { token }: AuthE2E
) {
  {
    const transferStatementDto = makeTransferStatementDto({
      ...overrider,
    });

    const { body: transferStatementBody } = await appRequest
      .post(`/api/v1/statements/transfers/${overrider.receiver_id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(transferStatementDto);

    return {
      body: transferStatementBody,
      dto: transferStatementDto,
    };
  }
}
