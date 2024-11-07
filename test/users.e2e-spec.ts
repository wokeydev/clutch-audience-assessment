import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { faker } from '@faker-js/faker';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();

    const signUpPayload = {
      name: faker.person.firstName(),
      email: faker.internet.email(),
      password: 'adminpassword',
      role: 'ADMIN',
    };
    await request(server).post('/auth/signup').send(signUpPayload).expect(201);

    const adminLoginResponse = await request(server)
      .post('/auth/login')
      .send({
        email: signUpPayload.email,
        password: 'adminpassword',
      })
      .expect(201);

    adminToken = adminLoginResponse.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users (GET)', () => {
    it('should be accessible and return a 200 status with search parameters', async () => {
      const response = await request(server)
        .get('/users')
        .query({ page: 0, pageCount: 10, search: 'test' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('total');
      expect(typeof response.body.total).toBe('number');
    });
  });
});
