import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { CreateStatementUseCase } from './CreateStatementUseCase';

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

export class CreateStatementController {
  async execute(request: Request, response: Response) {
    const { user_id } = request.params;
    const { id: sender_id } = request.user;
    const { amount, description } = request.body;

    const splittedPath = request.originalUrl.split('/');

    const type = splittedPath.length === 5
      ? splittedPath[splittedPath.length - 1] as OperationType
      : splittedPath[splittedPath.length - 2] as OperationType;

    const createStatement = container.resolve(CreateStatementUseCase);

    const statement = await createStatement.execute({
      user_id: type !== 'transfer' ? sender_id : user_id,
      sender_id: type === 'transfer' ? sender_id : null,
      type,
      amount,
      description
    });

    return response.status(201).json(statement);
  }
}
