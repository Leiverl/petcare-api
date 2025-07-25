import { Module } from '@nestjs/common';
import { FavoritosService } from './favoritos.service';
import { FavoritosController } from './favoritos.controller';
import { MongooseModule } from '@nestjs/mongoose'; // <-- IMPORTAR
import { Favorito, FavoritoSchema } from './schemas/favorito.schema'; // <-- IMPORTAR

@Module({
  // --- AÑADIR LA SECCIÓN DE IMPORTS ---
  imports: [
    MongooseModule.forFeature([{ name: Favorito.name, schema: FavoritoSchema }])
  ],
  controllers: [FavoritosController],
  providers: [FavoritosService],
})
export class FavoritosModule {}