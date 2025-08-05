import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InteraccionEvento } from './schemas/interaccion-evento.schema';

@Injectable()
export class InteraccionesEventosService {
  constructor(@InjectModel(InteraccionEvento.name) private interaccionModel: Model<InteraccionEvento>) {}

  // --- NUEVO MÉTODO UNIFICADO ---
  async toggleInteres(usuarioId: string, eventoId: string): Promise<{ interesado: boolean }> {
    const filtro = { usuario: usuarioId, evento: eventoId };
    
    const interaccionExistente = await this.interaccionModel.findOne(filtro);

    if (interaccionExistente) {
      // Si ya existe, la eliminamos
      await this.interaccionModel.deleteOne(filtro);
      return { interesado: false }; // El usuario ya no está interesado
    } else {
      // Si no existe, la creamos
      const nuevaInteraccion = new this.interaccionModel(filtro);
      await nuevaInteraccion.save();
      return { interesado: true }; // El usuario ahora está interesado
    }
  }

  async getMisEventos(usuarioId: string) {
    return this.interaccionModel.find({ usuario: usuarioId })
      .populate({
        path: 'evento',
        populate: {
          path: 'organizador',
          select: 'nombre'
        }
      });
  }

  async getInteresadosPorEvento(eventoId: string) {
    return this.interaccionModel.find({ evento: eventoId }).populate('usuario', 'nombre correo');
  }

  async checkInteres(usuarioId: string, eventoId: string): Promise<{ interesado: boolean }> {
    const interes = await this.interaccionModel.findOne({ usuario: usuarioId, evento: eventoId });
    return { interesado: !!interes };
  }
}