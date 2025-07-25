import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { Usuario, UsuarioSchema } from './schemas/usuario.schema';
import { Refugio, RefugioSchema } from '../refugios/schemas/refugio.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Usuario.name,
        schema: UsuarioSchema,
      },
      { name: Refugio.name, schema: RefugioSchema },
    ]),
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  // Añade esta línea para exportar el servicio
  exports: [UsuariosService, MongooseModule],
})
export class UsuariosModule {}