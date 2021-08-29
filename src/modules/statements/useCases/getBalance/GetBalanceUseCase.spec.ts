import * as faker from 'faker/locale/pt_BR';

import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { GetBalanceUseCase } from './GetBalanceUseCase';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { AppError } from '../../../../shared/errors/AppError';

let statementsRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;
let getbalanceUseCase: GetBalanceUseCase;
let createUserUseCase: CreateUserUseCase;

describe('Get Balance Use Case', () => {
  beforeEach(() => {
    statementsRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    getbalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository);
  })

  it('Should be able to get balance from an user', async () => {
    const { id } = await createUserUseCase.execute({
      email: faker.internet.email(),
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      password: faker.random.word()
    });

    if(id !== undefined) {
      const balance = await getbalanceUseCase.execute({
        user_id: id
      })

      expect(balance).toHaveProperty('balance');
    }
  })

  it('Should not be able to get balance from an invalid user', async () => {
    expect(async () => {
      await getbalanceUseCase.execute({
        user_id: faker.datatype.uuid()
      })
    }).rejects.toBeInstanceOf(AppError);
  })
})
