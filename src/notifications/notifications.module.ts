import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificacionesController } from './notifications.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Notificacion, NotificacionSchema } from './schemas/notificacion.schema';
import { CronService } from './cron.service';
import { Evento, EventoSchema } from '../eventos/schemas/evento.schema';
import { InteraccionEvento, InteraccionEventoSchema } from '../interacciones-eventos/schemas/interaccion-evento.schema';
import { Usuario, UsuarioSchema } from '../usuarios/schemas/usuario.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notificacion.name, schema: NotificacionSchema },
      { name: Usuario.name, schema: UsuarioSchema },
      { name: Evento.name, schema: EventoSchema },
      { name: InteraccionEvento.name, schema: InteraccionEventoSchema }
    ])
  ],
  controllers: [NotificacionesController],
  providers: [NotificationsService, CronService],
  exports: [NotificationsService],
})
export class NotificationsModule {}