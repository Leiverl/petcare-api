import { Module } from '@nestjs/common';
import { SolicitudesAdopcionService } from './solicitudes-adopcion.service';
import { SolicitudesAdopcionController } from './solicitudes-adopcion.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SolicitudAdopcion, SolicitudAdopcionSchema } from './schemas/solicitud-adopcion.schema';
import { Mascota, MascotaSchema } from '../mascotas/schemas/mascota.schema';
import { PdfModule } from '../pdf/pdf.module'; // IMPORTAR
import { EmailModule } from '../email/email.module'; // IMPORTAR
import { CloudinaryModule } from '../cloudinary/cloudinary.module'; // IMPORTAR
import { Refugio, RefugioSchema } from '../refugios/schemas/refugio.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { ConversacionesModule } from '../conversaciones/conversaciones.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SolicitudAdopcion.name,
        schema: SolicitudAdopcionSchema,
      },
      {
        name: Mascota.name,
        schema: MascotaSchema,
      },
      { name: Refugio.name, schema: RefugioSchema }
    ]),
    PdfModule, // AÑADIR
    EmailModule, // AÑADIR
    CloudinaryModule, // AÑADIR
    NotificationsModule,
    ConversacionesModule
  ],
  controllers: [SolicitudesAdopcionController],
  providers: [SolicitudesAdopcionService],
})
export class SolicitudesAdopcionModule {}