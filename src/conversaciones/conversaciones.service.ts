import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversacion } from './schemas/conversacion.schema';
import { Mensaje } from '../mensajes/schemas/mensaje.schema';

@Injectable()
export class ConversacionesService {
  constructor(
    @InjectModel(Conversacion.name) private conversacionModel: Model<Conversacion>,
    @InjectModel(Mensaje.name) private mensajeModel: Model<Mensaje>,
  ) {}

  async create(data: { solicitudAdopcion: string, participantes: string[] }): Promise<Conversacion> {
    const nuevaConversacion = new this.conversacionModel(data);
    return nuevaConversacion.save();
  }

  async findById(id: string): Promise<Conversacion | null> {
    return this.conversacionModel.findById(id);
  }
  
  async findBySolicitudId(solicitudId: string): Promise<Conversacion | null> {
    return this.conversacionModel.findOne({ solicitudAdopcion: solicitudId });
  }

  async getHistorial(conversacionId: string) {
    return this.mensajeModel
      .find({ conversacion: conversacionId })
      .sort({ createdAt: 1 })
      .populate('remitente', 'nombre fotoPerfil');
  }
}