import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { Evento } from './schemas/evento.schema';
import { Usuario } from '../usuarios/schemas/usuario.schema';
import { Refugio } from '../refugios/schemas/refugio.schema';

@Injectable()
export class EventosService {
  constructor(
    @InjectModel(Evento.name) private eventoModel: Model<Evento>,
    @InjectModel(Refugio.name) private refugioModel: Model<Refugio>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(createEventoDto: CreateEventoDto, user: Usuario, file: Express.Multer.File): Promise<Evento> {
    if (!file) throw new NotFoundException('Se requiere una imagen principal para el evento.');

    let organizadorId = createEventoDto.organizador;

    if (user.rol === 'REFUGIO') {
      const refugioDelUsuario = await this.refugioModel.findOne({ propietario: user._id });
      if (!refugioDelUsuario) throw new UnauthorizedException('El usuario no tiene un refugio asociado.');
      organizadorId = (refugioDelUsuario as any)._id.toString();
    } else if (user.rol === 'ADMIN' && !organizadorId) {
      throw new UnauthorizedException('Un ADMIN debe especificar el refugio organizador.');
    }
    
    const uploadResult = await this.cloudinaryService.uploadFile(file);
    
    const nuevoEvento = new this.eventoModel({
      ...createEventoDto,
      organizador: organizadorId,
      imagenPrincipal: uploadResult.secure_url,
    });

    return nuevoEvento.save();
  }

  async findAll(user: Usuario): Promise<Evento[]> {
    if (user.rol === 'ADMIN' || user.rol === 'ADOPTANTE') {
      // El Admin ve todos los eventos
      return this.eventoModel.find().populate('organizador', 'nombre').exec();
    }

    if (user.rol === 'REFUGIO') {
      // El Refugio solo ve los eventos de su propio refugio
      const refugioDelUsuario = await this.refugioModel.findOne({ propietario: user._id });
      if (!refugioDelUsuario) return []; // Si no tiene refugio, no ve nada

      return this.eventoModel.find({ organizador: refugioDelUsuario._id }).populate('organizador', 'nombre').exec();
    }
    
    // Otros roles no deberían llegar aquí, pero por seguridad
    return [];
  }

  async findOne(id: string): Promise<Evento> {
    const evento = await this.eventoModel.findById(id).populate('organizador', 'nombre').exec();
    if (!evento) throw new NotFoundException(`Evento con ID "${id}" no encontrado.`);
    return evento;
  }

  async update(id: string, user: Usuario, updateEventoDto: UpdateEventoDto, file?: Express.Multer.File): Promise<Evento> {
    const eventoExistente = await this.eventoModel.findById(id);
    if (!eventoExistente) throw new NotFoundException(`Evento con ID "${id}" no encontrado.`);

    if (user.rol === 'REFUGIO') {
      const refugioDelUsuario = await this.refugioModel.findOne({ propietario: user._id });
      // --- CORRECCIÓN AQUÍ ---
      if (eventoExistente.organizador.toString() !== (refugioDelUsuario as any)?._id.toString()) {
        throw new UnauthorizedException('No tienes permiso para editar este evento.');
      }
    }
    
    const updateData: any = { ...updateEventoDto };
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadFile(file);
      updateData.imagenPrincipal = uploadResult.secure_url;
    }

    const eventoActualizado = await this.eventoModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!eventoActualizado) throw new NotFoundException(`Error al actualizar el evento.`);
    return eventoActualizado;
  }

  async remove(id: string, user: Usuario): Promise<{ message: string }> {
    const eventoExistente = await this.eventoModel.findById(id);
    if (!eventoExistente) throw new NotFoundException(`Evento con ID "${id}" no encontrado.`);

    if (user.rol === 'REFUGIO') {
      const refugioDelUsuario = await this.refugioModel.findOne({ propietario: user._id });
      // --- CORRECCIÓN AQUÍ ---
      if (eventoExistente.organizador.toString() !== (refugioDelUsuario as any)?._id.toString()) {
        throw new UnauthorizedException('No tienes permiso para eliminar este evento.');
      }
    }

    const result = await this.eventoModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException(`Evento con ID "${id}" no encontrado.`);
    return { message: `Evento con ID "${id}" eliminado exitosamente.` };
  }
}