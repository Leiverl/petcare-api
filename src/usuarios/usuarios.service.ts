import { Injectable, ConflictException, NotFoundException  } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { Usuario } from './schemas/usuario.schema';
import * as bcrypt from 'bcrypt';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Refugio } from '../refugios/schemas/refugio.schema';
@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
    @InjectModel(Refugio.name) private refugioModel: Model<Refugio>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const { correo, contrasena } = createUsuarioDto;

    const existeCorreo = await this.usuarioModel.findOne({ correo });
    if (existeCorreo) {
      throw new ConflictException('El correo electrónico ya está registrado.');
    }

    const salt = await bcrypt.genSalt(10);
    const contrasenaHasheada = await bcrypt.hash(contrasena, salt);

    const nuevoUsuario = new this.usuarioModel({
      ...createUsuarioDto,
      contrasena: contrasenaHasheada,
    });

    return nuevoUsuario.save();
  }

  // --- NUEVO MÉTODO ---
  // Este método simplemente devuelve todos los usuarios.
  // La contraseña se elimina automáticamente gracias a la transformación del schema.
  async findAll(): Promise<Usuario[]> {
    return this.usuarioModel.find().exec();
  }

  async findOne(id: string): Promise<Usuario> {
    const usuario = await this.usuarioModel.findById(id);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }
    return usuario;
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    // Si se está actualizando la contraseña, la encriptamos
    if (updateUsuarioDto.contrasena) {
      const salt = await bcrypt.genSalt(10);
      updateUsuarioDto.contrasena = await bcrypt.hash(updateUsuarioDto.contrasena, salt);
    }

    const usuarioActualizado = await this.usuarioModel.findByIdAndUpdate(id, updateUsuarioDto, { new: true });
    if (!usuarioActualizado) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }
    return usuarioActualizado;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.usuarioModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }
    return { message: `Usuario con ID "${id}" eliminado exitosamente.` };
  }
  async findAvailableShelterUsers(): Promise<Usuario[]> {
    // 1. Obtener los IDs de todos los propietarios que ya tienen un refugio
    const assignedOwners = await this.refugioModel.find().distinct('propietario');

    // 2. Buscar usuarios con rol 'REFUGIO' cuyo ID no esté en la lista de asignados
    const availableUsers = await this.usuarioModel.find({
      rol: 'REFUGIO',
      _id: { $nin: assignedOwners }
    });

    return availableUsers;
  }
  async updateProfile(userId: string, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    // Si se está actualizando la contraseña, la encriptamos
    if (updateUsuarioDto.contrasena) {
      const salt = await bcrypt.genSalt(10);
      updateUsuarioDto.contrasena = await bcrypt.hash(updateUsuarioDto.contrasena, salt);
    } else {
      // Nos aseguramos de no borrar la contraseña si no se envía una nueva
      delete updateUsuarioDto.contrasena;
    }
    
    const usuarioActualizado = await this.usuarioModel.findByIdAndUpdate(userId, updateUsuarioDto, { new: true });
    if (!usuarioActualizado) {
      throw new NotFoundException(`Usuario no encontrado.`);
    }
    return usuarioActualizado;
  }

}