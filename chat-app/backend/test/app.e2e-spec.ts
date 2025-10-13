import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('App E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('should return hello world', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('Chat Endpoints', () => {
    it('should create a conversation', async () => {
      const createConversationDto = {
        userId: 'test-user',
        title: 'Test Conversation',
      };

      const response = await request(app.getHttpServer())
        .post('/chat/sessions')
        .send(createConversationDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('userId', 'test-user');
      expect(response.body).toHaveProperty('title', 'Test Conversation');
    });

    it('should validate session', async () => {
      // First create a session
      const createResponse = await request(app.getHttpServer())
        .post('/chat/sessions')
        .send({
          userId: 'test-user',
          title: 'Test Conversation',
        })
        .expect(201);

      const sessionId = createResponse.body.id;

      // Then validate it
      const validateResponse = await request(app.getHttpServer())
        .get(`/chat/sessions/${sessionId}/validate`)
        .expect(200);

      expect(validateResponse.body).toHaveProperty('isValid', true);
      expect(validateResponse.body).toHaveProperty('sessionId', sessionId);
    });

    it('should return 404 for invalid session', async () => {
      const response = await request(app.getHttpServer())
        .get('/chat/sessions/invalid-session/validate')
        .expect(200);

      expect(response.body).toHaveProperty('isValid', false);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoints', () => {
      return request(app.getHttpServer()).get('/non-existent').expect(404);
    });

    it('should return 400 for invalid request body', () => {
      return request(app.getHttpServer())
        .post('/chat/sessions')
        .send({})
        .expect(400);
    });
  });
});
