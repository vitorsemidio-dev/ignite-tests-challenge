import { Router } from "express";

import { CreateStatementController } from "../modules/statements/useCases/createStatement/CreateStatementController";
import { GetBalanceController } from "../modules/statements/useCases/getBalance/GetBalanceController";
import { GetStatementOperationController } from "../modules/statements/useCases/getStatementOperation/GetStatementOperationController";
import { CreateTransferStatementController } from "../modules/statements/useCases/createTransferStatement/CreateTransferStatementController";
import { ensureAuthenticated } from "../shared/infra/http/middlwares/ensureAuthenticated";

const statementRouter = Router();
const getBalanceController = new GetBalanceController();
const createStatementController = new CreateStatementController();
const getStatementOperationController = new GetStatementOperationController();
const createTransferStatementController =
  new CreateTransferStatementController();

statementRouter.use(ensureAuthenticated);

statementRouter.get("/balance", getBalanceController.execute);
statementRouter.post("/deposit", createStatementController.execute);
statementRouter.post("/withdraw", createStatementController.execute);
statementRouter.get("/:statement_id", getStatementOperationController.execute);
statementRouter.post(
  "/transfers/:user_id",
  createTransferStatementController.execute
);

export { statementRouter };
