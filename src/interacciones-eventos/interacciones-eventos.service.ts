import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InteraccionEvento } from './schemas/interaccion-evento.schema';

@Injectable()
export class InteraccionesEventosService {
  constructor(@InjectModel(InteraccionEvento.name) private interaccionModel: Model<InteraccionEvento>) {}

  async addInteres(usuarioId: string, eventoId: string) {
    // El índice unique en el schema previene duplicados
    const nuevaInteraccion = new this.interaccionModel({ usuario: usuarioId, evento: eventoId });
    return nuevaInteraccion.save();
  }

  async removeInteres(usuarioId: string, eventoId: string) {
    const result = await this.interaccionModel.deleteOne({ usuario: usuarioId, evento: eventoId });
    if (result.deletedCount === 0) throw new NotFoundException('Interés no encontrado.');
    return { message: 'Interés eliminado' };
  }

  async getMisEventos(usuarioId: string) {
    return this.interaccionModel.find({ usuario: usuarioId }).populate('evento');
  }

  async getInteresadosPorEvento(eventoId: string) {
    return this.interaccionModel.find({ evento: eventoId }).populate('usuario', 'nombre correo');
  }

  async checkInteres(usuarioId: string, eventoId: string): Promise<{ interesado: boolean }> {
    const interes = await this.interaccionModel.findOne({ usuario: usuarioId, evento: eventoId });
    return { interesado: !!interes };
  }
}