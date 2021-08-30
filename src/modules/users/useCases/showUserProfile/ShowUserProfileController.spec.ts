import * as faker from 'faker/locale/pt_BR';
import { Connection } from 'typeorm';
import request from 'supertest';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;
let password: string;
let email: string;
let token: string;

describe('Show User Profile Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

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

  it('Should be able to show a profile an user', async () => {
    const response = await request(app).get('/api/v1/profile').set({
      Authorization: `Bearer ${token}`
    })
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('id');
  })

  it('Should not be able to show a profile an user unauthenticated', async () => {
    const response = await request(app).get('/api/v1/profile');
    expect(response.statusCode).toBe(401);
  })
})
