import { Module } from '@nestjs/common';
import { ChatModule } from '../../modules/chat.module';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [ChatModule],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class WebSocketModule {}
