import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SubscriberModule } from './subscriber/subscriber.module';
import { SubscriberService } from './subscriber/subscriber.service';

@Module({
  imports: [SubscriberModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
