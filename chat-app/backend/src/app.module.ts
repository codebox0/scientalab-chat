import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import { EnvironmentVariables } from './config/env.validation';
import { WebSocketModule } from './infrastructure/adapters/websocket/websocket.module';
import { BioMCPModule } from './infrastructure/modules/biomcp.module';
import { ChatModule } from './infrastructure/modules/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig],
      validate: (config: Record<string, unknown>) => {
        const validatedConfig = new EnvironmentVariables();
        Object.assign(validatedConfig, config);

        // Simple validation - in production you'd use class-validator
        if (!validatedConfig.OPENAI_API_KEY) {
          throw new Error('OPENAI_API_KEY is required');
        }
        if (!validatedConfig.BIOMCP_URL) {
          throw new Error('BIOMCP_URL is required');
        }

        return validatedConfig;
      },
    }),
    ChatModule,
    BioMCPModule,
    WebSocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
