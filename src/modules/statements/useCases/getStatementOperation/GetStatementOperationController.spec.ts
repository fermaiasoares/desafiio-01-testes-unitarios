import * as faker from 'faker/locale/pt_BR';
import { Connection } from 'typeorm';
import request from 'supertest';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;
let password: string;
let email: string;
let token: string;
let amount: number;
let description: string;

describe('Get Statement Operation Controller.spec', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  beforeEach(async () => {
    password = faker.random.word();
    email = faker.internet.email();
    amount = faker.datatype.number(100);
    description = faker.random.words();

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

  it('Should be able to show deposit statement operation', async () => {
    const statement = (await request(app).post('/api/v1/statements/deposit').set({
      Authorization: `Bearer ${token}`
    }).send({
      amount,
      description
    })).body;

    const response = await request(app).get(`/api/v1/statements/${statement.id}`).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(Number(response.body.amount)).toEqual(amount);
  })

  it('Should be able to show withdraw statement operation', async () => {
    await request(app).post('/api/v1/statements/deposit').set({
      Authorization: `Bearer ${token}`
    }).send({
      amount,
      description
    })

    const statement = (await request(app).post('/api/v1/statements/withdraw').set({
      Authorization: `Bearer ${token}`
    }).send({
      amount,
      description
    })).body;

    const response = await request(app).get(`/api/v1/statements/${statement.id}`).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(Number(response.body.amount)).toEqual(amount);
  })

  it('Should not be able to show deposit statement operation for unauthenticated user', async () => {
    const statement = (await request(app).post('/api/v1/statements/deposit').set({
      Authorization: `Bearer ${token}`
    }).send({
      amount,
      description
    })).body;

    const response = await request(app).get(`/api/v1/statements/${statement.id}`);

    expect(response.statusCode).toBe(401);
  })

  it('Should not be able to show withdraw statement operation for unauthenticated user', async () => {
    await request(app).post('/api/v1/statements/deposit').set({
      Authorization: `Bearer ${token}`
    }).send({
      amount,
      description
    });

    const statement = (await request(app).post('/api/v1/statements/withdraw').set({
      Authorization: `Bearer ${token}`
    }).send({
      amount,
      description
    })).body;

    const response = await request(app).get(`/api/v1/statements/${statement.id}`);

    expect(response.statusCode).toBe(401);
  })

  it('Should not be able to show a statement invalid operation', async () => {
    const statement_id = faker.datatype.uuid();
    const response = await request(app).get(`/api/v1/statements/${statement_id}`).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.statusCode).toBe(404);
  })
})
