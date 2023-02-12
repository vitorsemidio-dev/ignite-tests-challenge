import { Statement } from "../entities/Statement";

type StatementMapParams = {
  statement: Statement;
};

export class StatementMap {
  static toDTO({ statement }: StatementMapParams) {
    const [parsedStatement] = [statement].map(
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

    return parsedStatement;
  }
}
