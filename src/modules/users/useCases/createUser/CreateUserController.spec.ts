import * as faker from 'faker/locale/pt_BR';
import { Connection } from 'typeorm';
import request from 'supertest';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Create User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
  })

  it('Should be able to create a new user', async () => {
    const response = await request(app).post('/api/v1/users').send({
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      email: faker.internet.email(),
      password: faker.random.word()
    })

    expect(response.statusCode).toBe(201);
  })

  it('Should not be able to create a new user with same email another user', async () => {
    const email = faker.internet.email();

    await request(app).post('/api/v1/users').send({
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      email,
      password: faker.random.word()
    })

    const response = await request(app).post('/api/v1/users').send({
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      email,
      password: faker.random.word()
    })

    expect(response.statusCode).toBe(400);
  })
})
