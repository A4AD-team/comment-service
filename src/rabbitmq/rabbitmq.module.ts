import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { CommentsRpcService } from './comments-rpc.service';
import { CommentsRpcController } from './comments-rpc.controller';

@Module({
  imports: [
    RabbitMQModule.forRoot({
      uri: process.env.RABBITMQ_URI || 'amqp://guest:guest@localhost:5672',
      connectionInitOptions: {
        wait: true,
        timeout: 10000,
      },
      exchanges: [
        {
          name: 'comments',
          type: 'topic',
        },
        {
          name: 'posts',
          type: 'topic',
        },
      ],
      enableControllerDiscovery: true,
    }),
  ],
  providers: [CommentsRpcService],
  controllers: [CommentsRpcController],
  exports: [RabbitMQModule],
})
export class RabbitMQModuleConfig {}
