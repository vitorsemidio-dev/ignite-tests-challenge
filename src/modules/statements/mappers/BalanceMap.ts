import { Statement } from "../entities/Statement";

type BalanceMapParams = {
  statement: Statement[];
  balance: number;
};

export class BalanceMap {
  static toDTO({ statement, balance }: BalanceMapParams) {
    const parsedStatement = statement.map(
      ({
        id,
        amount,
        description,
        type,
        created_at,
        updated_at,
        sender_id,
      }) => ({
        id,
        amount: Number(amount),
        description,
        type,
        created_at,
        updated_at,
        sender_id,
      })
    );

    return {
      statement: parsedStatement,
      balance: Number(balance),
    };
  }
}
