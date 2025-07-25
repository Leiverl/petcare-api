import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Mensaje } from './schemas/mensaje.schema';

@Injectable()
export class MensajesService {
  constructor(@InjectModel(Mensaje.name) private mensajeModel: Model<Mensaje>) {}

  async create(data: { conversacion: string, remitente: string, cuerpo: string }): Promise<Mensaje> {
    const nuevoMensaje = new this.mensajeModel(data);
    await nuevoMensaje.save();
    return nuevoMensaje.populate('remitente', 'nombre fotoPerfil');
  }
}