import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PdfService } from './pdf/pdf.service'; // <-- IMPORTAR

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- AÑADIMOS LA INICIALIZACIÓN EXPLÍCITA ---
  //const pdfService = app.get(PdfService);
//await pdfService.init(); // Esperamos a que Puppeteer esté listo
  // ------------------------------------------

  // Configurar un prefijo global para todas las rutas (ej: /api/v1/...)
  app.setGlobalPrefix('api/v1');

  // Habilitar la validación global para todos los DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuración de Swagger para la documentación de la API
  const config = new DocumentBuilder()
    .setTitle('PetCare API')
    .setDescription('Documentación de la API para el ecosistema de adopción de mascotas PetCare')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Habilitar CORS
  app.enableCors();

  await app.listen(3000);

  const server = app.getHttpServer();
  server.setTimeout(600000);
}
bootstrap();