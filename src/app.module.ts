import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { RefugiosModule } from './refugios/refugios.module';
import { MascotasModule } from './mascotas/mascotas.module';
import { SolicitudesAdopcionModule } from './solicitudes-adopcion/solicitudes-adopcion.module';
import { EventosModule } from './eventos/eventos.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FavoritosModule } from './favoritos/favoritos.module';
import { InteraccionesEventosModule } from './interacciones-eventos/interacciones-eventos.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PdfModule } from './pdf/pdf.module';
import { EmailModule } from './email/email.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ConversacionesModule } from './conversaciones/conversaciones.module';
import { MensajesModule } from './mensajes/mensajes.module';
import { ChatGateway } from './chat/chat.gateway';
import { EventEmitterModule } from '@nestjs/event-emitter'
@Module({
  imports: [
    // 1. Módulo de Configuración para leer variables de entorno (.env)
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Módulo de Mongoose para la conexión a la base de datos
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    
    // Módulos de la aplicación
    UsuariosModule,
    AuthModule,
    RefugiosModule,
    MascotasModule,
    SolicitudesAdopcionModule,
    EventosModule,
    DashboardModule,
    FavoritosModule,
    InteraccionesEventosModule,
    PdfModule,
    EmailModule,
    CloudinaryModule,
    NotificationsModule,
    ConversacionesModule,
    MensajesModule,
  ],
  controllers: [AppController],
  providers: [AppService, ChatGateway],
})
export class AppModule {}