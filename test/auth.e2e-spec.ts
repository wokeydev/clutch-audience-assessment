import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { faker } from '@faker-js/faker';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/signup (POST)', () => {
    it('should successfully sign up a new user', async () => {
      const signupPayload = {
        name: faker.person.firstName(),
        email: faker.internet.email(),
        password: 'abc',
        referralCode: faker.string.alphanumeric(6).toUpperCase(),
      };

      const response = await request(server)
        .post('/auth/signup')
        .send(signupPayload)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');
    });
  });

  describe('/auth/login (POST)', () => {
    it('should log in an existing user successfully', async () => {
      const signupPayload = {
        name: faker.person.firstName(),
        email: faker.internet.email(),
        password: 'abc',
        referralCode: faker.string.alphanumeric(6).toUpperCase(),
      };

      // Sign up the user first to ensure they exist for login
      await request(server)
        .post('/auth/signup')
        .send(signupPayload)
        .expect(201);

      const loginPayload = {
        email: signupPayload.email,
        password: signupPayload.password,
      };

      const response = await request(server)
        .post('/auth/login')
        .send(loginPayload)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: signupPayload.name,
        email: signupPayload.email,
        role: expect.any(String),
        token: expect.any(String),
      });
    });

    it('should fail to log in with incorrect password', async () => {
      const signupPayload = {
        name: faker.person.firstName(),
        email: faker.internet.email(),
        password: 'abc',
        referralCode: faker.string.alphanumeric(6).toUpperCase(),
      };

      // Sign up the user first to ensure they exist for login
      await request(server)
        .post('/auth/signup')
        .send(signupPayload)
        .expect(201);

      const loginPayload = {
        email: signupPayload.email,
        password: 'wrongpassword',
      };

      const response = await request(server)
        .post('/auth/login')
        .send(loginPayload)
        .expect(401);

      expect(response.body.message).toBe('Invalid email or password');
    });
  });
});
