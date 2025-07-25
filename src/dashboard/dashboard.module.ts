import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Mascota, MascotaSchema } from '../mascotas/schemas/mascota.schema';
import { SolicitudAdopcion, SolicitudAdopcionSchema } from '../solicitudes-adopcion/schemas/solicitud-adopcion.schema';
import { Refugio, RefugioSchema } from '../refugios/schemas/refugio.schema';
import { Conversacion, ConversacionSchema } from '../conversaciones/schemas/conversacion.schema';
import { Mensaje, MensajeSchema } from '../mensajes/schemas/mensaje.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Mascota.name, schema: MascotaSchema },
      { name: SolicitudAdopcion.name, schema: SolicitudAdopcionSchema },
      { name: Refugio.name, schema: RefugioSchema },
       { name: Conversacion.name, schema: ConversacionSchema }, // <-- AÑADIR
      { name: Mensaje.name, schema: MensajeSchema },
    ])
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}