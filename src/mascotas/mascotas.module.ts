import { Module } from '@nestjs/common';
import { MascotasService } from './mascotas.service';
import { MascotasController } from './mascotas.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Mascota, MascotaSchema } from './schemas/mascota.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module'; // Importamos Cloudinary
import { Refugio, RefugioSchema } from '../refugios/schemas/refugio.schema';
import { SolicitudAdopcion, SolicitudAdopcionSchema } from '../solicitudes-adopcion/schemas/solicitud-adopcion.schema'; // <-- IMPORTAR
import { Favorito, FavoritoSchema } from '../favoritos/schemas/favorito.schema'; // <-- IMPORTAR
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Mascota.name,
        schema: MascotaSchema,
      },
      { name: Refugio.name, schema: RefugioSchema },
      { name: SolicitudAdopcion.name, schema: SolicitudAdopcionSchema }, // <-- AÑADIR
      { name: Favorito.name, schema: FavoritoSchema }, // <-- AÑADIR
    ]),
    CloudinaryModule, // Lo añadimos a los imports
  ],
  controllers: [MascotasController],
  providers: [MascotasService],
})
export class MascotasModule {}