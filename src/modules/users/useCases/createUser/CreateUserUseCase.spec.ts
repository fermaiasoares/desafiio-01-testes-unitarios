import * as faker from 'faker/locale/pt_BR';
import { CreateUserUseCase } from './CreateUserUseCase';
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { AppError } from '../../../../shared/errors/AppError';

let createUserUseCase: CreateUserUseCase;
let usersRepository: InMemoryUsersRepository;

describe('Create User Usecase', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  })

  it('Should be able to create a new user', async () => {
    const user = await createUserUseCase.execute({
      email: faker.internet.email(),
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      password: faker.random.word(),
    })

    expect(user).toHaveProperty('id');
  })

  it('Should not be able to create a new user with same email another user', async () => {
    const email = faker.internet.email();

    await createUserUseCase.execute({
      email,
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      password: faker.random.word(),
    })

    expect(async () => {
      await createUserUseCase.execute({
        email,
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        password: faker.random.word(),
      })
    }).rejects.toBeInstanceOf(AppError);
  })
})
