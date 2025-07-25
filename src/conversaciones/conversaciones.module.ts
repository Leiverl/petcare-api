import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversacionesService } from './conversaciones.service';
import { ConversacionesController } from './conversaciones.controller';
import { Conversacion, ConversacionSchema } from './schemas/conversacion.schema';
import { Mensaje, MensajeSchema } from '../mensajes/schemas/mensaje.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversacion.name, schema: ConversacionSchema },
      { name: Mensaje.name, schema: MensajeSchema },
    ]),
  ],
  controllers: [ConversacionesController],
  providers: [ConversacionesService],
  exports: [ConversacionesService], // Exportamos para usarlo en otros módulos
})
export class ConversacionesModule {}