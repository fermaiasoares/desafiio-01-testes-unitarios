import * as faker from 'faker/locale/pt_BR';
import { Connection } from 'typeorm';
import request from 'supertest';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;
let password: string;
let email: string;
let token: string;

describe('Create User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  beforeEach(async () => {
    password = faker.random.word();
    email = faker.internet.email();

    await request(app).post('/api/v1/users').send({
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      email,
      password
    })

    const response = await request(app).post('/api/v1/sessions').send({
      email,
      password
    })

    token = response.body.token;
  })

  afterAll(async () => {
    await connection.dropDatabase();
  })

  it('Should be able to create a statement type deposit', async () => {
    const response = await request(app).post('/api/v1/statements/deposit').set({
      Authorization: `Bearer ${token}`
    }).send({
      amount: faker.datatype.number(100),
      description: faker.random.words()
    })

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
  })

  it('Should not be able to create a statement type deposit for user unauthenticated', async () => {
    const response = await request(app).post('/api/v1/statements/deposit').send({
      amount: faker.datatype.number(100),
      description: faker.random.words()
    })

    expect(response.statusCode).toBe(401);
  })

  it('Should be able to create a statement type witdraw', async () => {
    const amount = faker.datatype.number(100);

    await request(app).post('/api/v1/statements/deposit').set({
      Authorization: `Bearer ${token}`
    }).send({
      amount,
      description: faker.random.words()
    })

    const response = await request(app).post('/api/v1/statements/withdraw').set({
      Authorization: `Bearer ${token}`
    }).send({
      amount,
      description: faker.random.words()
    })

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
  })

  it('Should not be able to create a statement type withdraw for user unauthenticated', async () => {
    const amount = faker.datatype.number(100);

    await request(app).post('/api/v1/statements/deposit').set({
      Authorization: `Bearer ${token}`
    }).send({
      amount,
      description: faker.random.words()
    })

    const response = await request(app).post('/api/v1/statements/withdraw').send({
      amount,
      description: faker.random.words()
    })

    expect(response.statusCode).toBe(401);
  })

  it('Should not be able to create a statement type withdraw for user with insufficient funds', async () => {
    const amount = faker.datatype.number(100);
    const response = await request(app).post('/api/v1/statements/withdraw').set({
      Authorization: `Bearer ${token}`
    }).send({
      amount,
      description: faker.random.words()
    })
    expect(response.statusCode).toBe(400);
  })
})
