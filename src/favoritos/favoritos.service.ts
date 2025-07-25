import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Favorito } from './schemas/favorito.schema';

@Injectable()
export class FavoritosService {
  constructor(@InjectModel(Favorito.name) private favoritoModel: Model<Favorito>) {}

  async getMisFavoritos(usuarioId: string) {
    return this.favoritoModel.find({ usuario: usuarioId }).populate({
        path: 'mascota',
        populate: { path: 'refugio', select: 'nombre' }
    });
  }

  async addFavorito(usuarioId: string, mascotaId: string) {
    const existe = await this.favoritoModel.findOne({ usuario: usuarioId, mascota: mascotaId });
    if (existe) {
      throw new ConflictException('Esta mascota ya está en tus favoritos.');
    }
    const nuevoFavorito = new this.favoritoModel({ usuario: usuarioId, mascota: mascotaId });
    return nuevoFavorito.save();
  }

  async removeFavorito(usuarioId: string, mascotaId: string) {
    return this.favoritoModel.deleteOne({ usuario: usuarioId, mascota: mascotaId });
  }
}