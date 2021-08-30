import * as faker from 'faker/locale/pt_BR';
import { Connection } from 'typeorm';
import request from 'supertest';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Authenticate User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
  })

  it('Should be able create session for a user', async () => {
    const email = faker.internet.email();
    const password = faker.random.word();

    await request(app).post('/api/v1/users').send({
      email,
      password,
      name: `${faker.name.firstName()} ${faker.name.lastName()}`
    });

    const response = await request(app).post('/api/v1/sessions').send({
      email,
      password
    })

    expect(response.statusCode).toBe(200);
  })

  it('Should not be able create session for a user with invalid email', async () => {
    const email = faker.internet.email();
    const password = faker.random.word();

    await request(app).post('/api/v1/users').send({
      email,
      password,
      name: `${faker.name.firstName()} ${faker.name.lastName()}`
    });

    const response = await request(app).post('/api/v1/sessions').send({
      email: faker.internet.email(),
      password
    })

    expect(response.statusCode).toBe(401);
  })

  it('Should not be able create session for a user with invalid password', async () => {
    const email = faker.internet.email();
    const password = faker.random.word();

    await request(app).post('/api/v1/users').send({
      email,
      password,
      name: `${faker.name.firstName()} ${faker.name.lastName()}`
    });

    const response = await request(app).post('/api/v1/sessions').send({
      email,
      password:  faker.random.word()
    })

    expect(response.statusCode).toBe(401);
  })
})
