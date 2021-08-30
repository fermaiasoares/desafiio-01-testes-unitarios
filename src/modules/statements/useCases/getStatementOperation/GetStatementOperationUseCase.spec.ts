import * as faker from 'faker/locale/pt_BR';

import { GetStatementOperationUseCase } from './GetStatementOperationUseCase';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase';
import { OperationType } from '../../entities/Statement';
import { AppError } from '../../../../shared/errors/AppError';

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe('Get Statement Operation Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepository,
      statementsRepository
    );
  })

  it('Should be able to get a statement operation for an user', async () => {
    const user = await createUserUseCase.execute({
      email: faker.internet.email(),
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      password: faker.random.word()
    })

    if(user.id !== undefined) {
      const user_id = user.id;
      const statement = await createStatementUseCase.execute({
        user_id,
        description: faker.random.words(),
        type: OperationType.DEPOSIT,
        amount: faker.datatype.number(100)
      })

      const statement_id = statement.id as string;

      const statementOperation = await getStatementOperationUseCase.execute({
        user_id,
        statement_id
      })

      expect(statementOperation).toHaveProperty('id');
      expect(statementOperation.description).toEqual(statement.description);
    }
  })

  it('Should not be able to get statement operation for an invalid user', async () => {
    const user = await createUserUseCase.execute({
      email: faker.internet.email(),
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      password: faker.random.word()
    })

    if(user.id !== undefined) {
      const user_id = user.id;
      const statement = await createStatementUseCase.execute({
        user_id,
        description: faker.random.words(),
        type: OperationType.DEPOSIT,
        amount: faker.datatype.number(100)
      })

      const statement_id = statement.id as string;

      expect(async () => {
        await getStatementOperationUseCase.execute({
          user_id: faker.datatype.uuid(),
          statement_id
        })
      }).rejects.toBeInstanceOf(AppError);
    }
  })

  it('Should not be able to get statement operation for an invalid statement', async () => {
    const user = await createUserUseCase.execute({
      email: faker.internet.email(),
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      password: faker.random.word()
    })

    if(user.id !== undefined) {
      const user_id = user.id;
      expect(async () => {
        await getStatementOperationUseCase.execute({
          user_id,
          statement_id: faker.datatype.uuid()
        })
      }).rejects.toBeInstanceOf(AppError);
    }
  })
})
