import { Module } from '@nestjs/common';
import { EventosService } from './eventos.service';
import { EventosController } from './eventos.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Evento, EventoSchema } from './schemas/evento.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { Refugio, RefugioSchema } from '../refugios/schemas/refugio.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Evento.name, schema: EventoSchema },
      { name: Refugio.name, schema: RefugioSchema }
    ]),
    CloudinaryModule,
  ],
  controllers: [EventosController],
  providers: [EventosService],
})
export class EventosModule {}