import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Mascota } from '../mascotas/schemas/mascota.schema';
import { Refugio } from '../refugios/schemas/refugio.schema';
import { SolicitudAdopcion } from '../solicitudes-adopcion/schemas/solicitud-adopcion.schema';
import { Usuario } from '../usuarios/schemas/usuario.schema';
import { Conversacion } from '../conversaciones/schemas/conversacion.schema';
import { Mensaje } from '../mensajes/schemas/mensaje.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Mascota.name) private mascotaModel: Model<Mascota>,
    @InjectModel(SolicitudAdopcion.name) private solicitudModel: Model<SolicitudAdopcion>,
    @InjectModel(Refugio.name) private refugioModel: Model<Refugio>,
    @InjectModel(Conversacion.name) private conversacionModel: Model<Conversacion>,
    @InjectModel(Mensaje.name) private mensajeModel: Model<Mensaje>,
  ) {}

  async getStats(user: Usuario) {
    let mascotaFilter: any = {};
    let solicitudFilter: any = {};
    let conversacionFilter: any = {};

    if (user.rol === 'REFUGIO') {
      const refugio = await this.refugioModel.findOne({ propietario: user._id });
      if (refugio) {
        mascotaFilter.refugio = refugio._id;

        const mascotasDelRefugio = await this.mascotaModel.find({ refugio: refugio._id }).select('_id');
        const idsDeMascotas = mascotasDelRefugio.map(m => m._id);
        solicitudFilter.mascota = { $in: idsDeMascotas };
      }
    }

    // --- LÓGICA PARA CONTAR MENSAJES NUEVOS ---
    const conversaciones = await this.conversacionModel.find({ participantes: user._id }).select('_id');
    const idsDeConversaciones = conversaciones.map(c => c._id);

    const mensajesNuevos = await this.mensajeModel.countDocuments({
      conversacion: { $in: idsDeConversaciones },
      remitente: { $ne: user._id }, // Contar solo mensajes recibidos
      leido: false
    });
    // ---------------------------------------------

    const mascotasActivas = await this.mascotaModel.countDocuments({
      ...mascotaFilter,
      estado: 'DISPONIBLE',
    });

    const solicitudesPendientes = await this.solicitudModel.countDocuments({
      ...solicitudFilter,
      estado: { $in: ['NUEVA', 'EN_REVISION'] },
    });

    const fechaHaceUnMes = new Date();
    fechaHaceUnMes.setMonth(fechaHaceUnMes.getMonth() - 1);

    const adopcionesMes = await this.solicitudModel.countDocuments({
      ...solicitudFilter,
      estado: 'APROBADA',
      updatedAt: { $gte: fechaHaceUnMes },
    });

    return {
      mascotasActivas,
      solicitudesPendientes,
      adopcionesMes,
      mensajesNuevos, // Devolvemos el valor real
    };
  }
}