import * as faker from 'faker/locale/pt_BR';

import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { ShowUserProfileUseCase } from './ShowUserProfileUseCase';
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { User } from '../../entities/User';
import { AppError } from '../../../../shared/errors/AppError';

let usersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;

describe('Show User Profile Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
    createUserUseCase = new CreateUserUseCase(usersRepository);
  })

  it('Should be able to show a user profile', async () => {
    const { id } = await createUserUseCase.execute({
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      email: faker.internet.email(),
      password: faker.random.word()
    })

    let profile: User = {} as User;

    if(id !== undefined) {
      profile = await showUserProfileUseCase.execute(id);
    }
    expect(profile).toHaveProperty('id');
  })

  it('Should not be able to show a profile an invalid user', async () => {
    expect(async () => {
      const id = faker.datatype.uuid();
      await showUserProfileUseCase.execute(id)
    }).rejects.toBeInstanceOf(AppError);
  })
})
