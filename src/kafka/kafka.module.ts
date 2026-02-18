import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        useFactory: (configService: ConfigService) => {
          const brokers = configService.get<string[]>('kafka.brokers');
          const groupId = configService.get<string>('kafka.groupId');
          if (!brokers || brokers.length === 0) {
            throw new Error('Kafka brokers configuration is missing or empty');
          }
          if (!groupId) {
            throw new Error('Kafka groupId configuration is missing');
          }
          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: configService.get('kafka.clientId'),
                brokers,
              },
              consumer: {
                groupId,
              },
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class KafkaModule {}
