import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configuration des limites de taille pour les requêtes
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // Configuration CORS pour permettre les requêtes du frontend
  const corsOrigins = [
    configService.get<string>('CORS_ORIGIN'),
    configService.get<string>('FRONTEND_URL'),
    configService.get<string>('API_URL'),
  ].filter(Boolean); // Remove undefined values

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = configService.get<number>('server.port') || 4001;
  await app.listen(port);
  console.log(`🚀 Backend démarré sur le port ${port}`);
}
bootstrap();
