import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TerminusModule } from '@nestjs/terminus';
import { LoggerModule } from 'nestjs-pino';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { CommentsModule } from './comments/comments.module';
import { RabbitMQModuleConfig } from './rabbitmq/rabbitmq.module';
import { HealthModule } from './health/health.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig],
      envFilePath: ['.env', '.env.local'],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' }
            : undefined,
        customProps: (req) => ({
          correlationId: req.headers['x-correlation-id'],
        }),
      },
    }),
    PrometheusModule.register(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.mongodb.uri'),
      }),
      inject: [ConfigService],
    }),
    TerminusModule,
    CommentsModule,
    RabbitMQModuleConfig,
    HealthModule,
  ],
})
export class AppModule {}
