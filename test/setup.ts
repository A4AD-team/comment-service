import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from './../src/app.module';

let app: INestApplication;
let mongoServer: MongoMemoryServer;
let connection: Connection;

export const setupTestApp = async (): Promise<INestApplication> => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        ignoreEnvFile: true,
      }),
      MongooseModule.forRoot(mongoUri),
      AppModule,
    ],
  }).compile();

  app = moduleFixture.createNestApplication();
  app.useGlobalPipe();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  connection = moduleFixture.get<Connection>(getConnectionToken());

  await app.init();
  return app;
};

export const teardownTestApp = async (): Promise<void> => {
  if (app) {
    await app.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
};

export const clearDatabase = async (): Promise<void> => {
  if (connection) {
    const collections = connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
};

beforeAll(async () => {
  await setupTestApp();
});

afterAll(async () => {
  await teardownTestApp();
});

afterEach(async () => {
  await clearDatabase();
});
