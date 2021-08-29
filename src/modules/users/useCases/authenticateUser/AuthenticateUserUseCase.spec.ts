import * as faker from 'faker/locale/pt_BR';

import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase';

import { AppError } from '../../../../shared/errors/AppError';

let usersRespository: InMemoryUsersRepository;
let createUserUserCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe('Authenticate User Use Case', () => {
  beforeEach(() => {
    usersRespository = new InMemoryUsersRepository();
    createUserUserCase = new CreateUserUseCase(usersRespository);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRespository);
  })

  it('Should be able to create a session for a user', async () => {
    const password = faker.random.word();
    const email = faker.internet.email();

    await createUserUserCase.execute({
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      email,
      password
    });

    const session = await authenticateUserUseCase.execute({
      email,
      password
    })

    expect(session).toHaveProperty('token');
  })

  it('Should not be able to create a session for a user with wrong email', async () => {
    const password = faker.random.word();
    const email = faker.internet.email();

    await createUserUserCase.execute({
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      email,
      password
    });

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: faker.internet.email(),
        password
      })
    }).rejects.toBeInstanceOf(AppError);
  })

  it('Should not be able to create a session for a user with wrong password', async () => {
    const password = faker.random.word();
    const email = faker.internet.email();

    await createUserUserCase.execute({
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      email,
      password
    });

    expect(async () => {
      await authenticateUserUseCase.execute({
        email,
        password: faker.random.word()
      })
    }).rejects.toBeInstanceOf(AppError);
  })
})
