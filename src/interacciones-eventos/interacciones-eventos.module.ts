import { Module } from '@nestjs/common';
import { InteraccionesEventosService } from './interacciones-eventos.service';
import { InteraccionesEventosController } from './interacciones-eventos.controller';
import { MongooseModule } from '@nestjs/mongoose'; // <-- IMPORTAR
import { InteraccionEvento, InteraccionEventoSchema } from './schemas/interaccion-evento.schema'; // <-- IMPORTAR

@Module({
  // --- AÑADIR ESTA SECCIÓN ---
  imports: [
    MongooseModule.forFeature([{ name: InteraccionEvento.name, schema: InteraccionEventoSchema }])
  ],
  controllers: [InteraccionesEventosController],
  providers: [InteraccionesEventosService],
})
export class InteraccionesEventosModule {}