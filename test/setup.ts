// Test setup for integration tests only
// Unit tests should not import this file

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from './../src/app.module';

declare global {
  var __APP__: INestApplication | undefined;
  var __MONGO_SERVER__: MongoMemoryServer | undefined;
  var __CONNECTION__: Connection | undefined;
}

// Only set timeout for E2E tests
if (process.env.TEST_TYPE === 'e2e') {
  jest.setTimeout(120000);
}

export const setupTestApp = async (): Promise<INestApplication> => {
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [MongooseModule.forRoot(mongoUri), AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  global.__MONGO_SERVER__ = mongoServer;
  global.__APP__ = app;
  global.__CONNECTION__ = moduleFixture.get<Connection>(getConnectionToken());

  await app.init();
  return app;
};

export const teardownTestApp = async (): Promise<void> => {
  if (global.__APP__) {
    await global.__APP__.close();
  }
  if (global.__MONGO_SERVER__) {
    await global.__MONGO_SERVER__.stop();
  }
};

export const clearDatabase = async (): Promise<void> => {
  if (global.__CONNECTION__) {
    const collections = global.__CONNECTION__.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
};

// Global hooks only for E2E tests
if (process.env.TEST_TYPE === 'e2e') {
  beforeAll(async () => {
    await setupTestApp();
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  afterEach(async () => {
    await clearDatabase();
  });
}
