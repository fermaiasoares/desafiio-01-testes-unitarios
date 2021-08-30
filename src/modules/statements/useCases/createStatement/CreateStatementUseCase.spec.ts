import * as faker from 'faker/locale/pt_BR';

import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { CreateStatementUseCase } from './CreateStatementUseCase';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { OperationType } from '../../entities/Statement';
import { AppError } from '../../../../shared/errors/AppError';

let statementRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;

describe('Create Statement Use Case', () => {
  beforeEach(() => {
    statementRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementRepository
    );
  })

  it('Should be able create a new statement type deposit for an user', async () => {
    const user = await createUserUseCase.execute({
      email: faker.internet.email(),
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      password: faker.random.word()
    })

    if(user.id !== undefined) {
      const statement = await createStatementUseCase.execute({
        user_id: user.id,
        description: faker.random.words(),
        amount: faker.datatype.number(100),
        type: OperationType.DEPOSIT
      })

      expect(statement).toHaveProperty('id');
      expect(statement.type).toBe('deposit');
    }
  })

  it('Should be able create a new statement type withdraw for an user', async () => {
    const user = await createUserUseCase.execute({
      email: faker.internet.email(),
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      password: faker.random.word()
    })

    const amount = faker.datatype.number(100);

    if(user.id !== undefined) {
      await createStatementUseCase.execute({
        user_id: user.id,
        description: faker.random.words(),
        amount,
        type: OperationType.DEPOSIT
      })

      const statement = await createStatementUseCase.execute({
        user_id: user.id,
        description: faker.random.words(),
        amount,
        type: OperationType.WITHDRAW
      })

      expect(statement).toHaveProperty('id');
      expect(statement.type).toBe('withdraw');
    }
  })

  it('Should not be able to create a statement for an invalid user', async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: faker.datatype.uuid(),
        description: faker.random.words(),
        amount: faker.datatype.number(100),
        type: OperationType.DEPOSIT
      })
    }).rejects.toBeInstanceOf(AppError);
  })

  it('Should not be able to create a statement type of withdraw with insufficient funds', async () => {
    const user = await createUserUseCase.execute({
      email: faker.internet.email(),
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      password: faker.random.word()
    })

    const amount = faker.datatype.number(100);

    if(user.id !== undefined) {
      const user_id = user.id;

      expect(async () => {
        await createStatementUseCase.execute({
          user_id,
          description: faker.random.words(),
          amount,
          type: OperationType.WITHDRAW
        })
      }).rejects.toBeInstanceOf(AppError);
    }
  })
})
