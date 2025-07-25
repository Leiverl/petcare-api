import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateMascotaDto } from './dto/create-mascota.dto';
import { UpdateMascotaDto } from './dto/update-mascota.dto';
import { Mascota } from './schemas/mascota.schema';
import { Usuario } from '../usuarios/schemas/usuario.schema';
import { Refugio } from '../refugios/schemas/refugio.schema';
import { SolicitudAdopcion } from '../solicitudes-adopcion/schemas/solicitud-adopcion.schema';
import { Favorito } from '../favoritos/schemas/favorito.schema';

interface MascotasFilter {
  search?: string;
  especie?: string;
  tamano?: string;
  sexo?: string;
}

@Injectable()
export class MascotasService {
  constructor(
    @InjectModel(Mascota.name) private mascotaModel: Model<Mascota>,
    @InjectModel(Refugio.name) private refugioModel: Model<Refugio>,
    @InjectModel(SolicitudAdopcion.name) private solicitudModel: Model<SolicitudAdopcion>,
    @InjectModel(Favorito.name) private favoritoModel: Model<Favorito>,
    private cloudinaryService: CloudinaryService,
  ) {}

  // --- MÉTODO CORREGIDO ---
  async create(createMascotaDto: CreateMascotaDto, user: Usuario, files: Express.Multer.File[]): Promise<Mascota> {
    console.log('[Service] Método create iniciado.');

    try {
      let refugioId = createMascotaDto.refugio;

      // Si el usuario es un REFUGIO, buscamos su refugio y lo asignamos automáticamente
      if (user.rol === 'REFUGIO') {
        const refugioDelUsuario = await this.refugioModel.findOne({ propietario: user._id });
        if (!refugioDelUsuario) {
          throw new UnauthorizedException('Este usuario de refugio no tiene un perfil de refugio asignado.');
        }
        refugioId = (refugioDelUsuario as any)._id.toString();
      } else if (user.rol === 'ADMIN' && !refugioId) {
        // Si es ADMIN, nos aseguramos de que haya enviado un ID de refugio
        throw new UnauthorizedException('Un ADMIN debe especificar un refugio para la mascota.');
      }

      console.log('[Service] Iniciando subida a Cloudinary...');
      const uploadPromises = files.map(file => this.cloudinaryService.uploadFile(file));
      const uploadResults = await Promise.all(uploadPromises);
      console.log('[Service] Subida a Cloudinary completada.');
      
      const galeriaFotosUrls = uploadResults.map(result => result.secure_url);

      const nuevaMascota = new this.mascotaModel({
        ...createMascotaDto,
        refugio: refugioId, // Usamos el ID de refugio verificado
        galeriaFotos: galeriaFotosUrls,
      });

      console.log('[Service] Guardando en la base de datos...');
      const mascotaGuardada = await nuevaMascota.save();
      console.log('[Service] Guardado en la base de datos completado.');
      
      return mascotaGuardada;

    } catch (error) {
      console.error('[Service] Error en el proceso de creación:', error);
      throw error;
    }
  }

  async findAll(user?: Usuario, filters: MascotasFilter = {}): Promise<Mascota[]> {
    const query: any = {};
    if (!user || user.rol === 'ADOPTANTE') {
      query.estado = 'DISPONIBLE';
    }
    if (user && user.rol === 'REFUGIO') {
      const refugioDelUsuario = await this.refugioModel.findOne({ propietario: user._id });
      if (!refugioDelUsuario) return [];
      query.refugio = refugioDelUsuario._id;
    }
    if (filters.search) {
      query.nombre = { $regex: filters.search, $options: 'i' };
    }
    if (filters.especie) {
      query.especie = filters.especie;
    }
    if (filters.tamano) {
      query.tamano = filters.tamano;
    }
    if (filters.sexo) {
      query.sexo = filters.sexo;
    }
    return this.mascotaModel.find(query).populate('refugio').exec();
  }

  async findOne(id: string): Promise<Mascota> {
    const mascota = await this.mascotaModel.findById(id).populate('refugio').exec();
    if (!mascota) {
      throw new NotFoundException(`Mascota con ID "${id}" no encontrada.`);
    }
    return mascota;
  }

  async update(id: string, updateMascotaDto: UpdateMascotaDto, files: Express.Multer.File[]): Promise<Mascota> {
    const mascotaExistente = await this.mascotaModel.findById(id);
    if (!mascotaExistente) {
      throw new NotFoundException(`Mascota con ID "${id}" no encontrada.`);
    }
    let galeriaFotosUrls = mascotaExistente.galeriaFotos;
    if (files && files.length > 0) {
      const uploadPromises = files.map(file => this.cloudinaryService.uploadFile(file));
      const uploadResults = await Promise.all(uploadPromises);
      galeriaFotosUrls = uploadResults.map(result => result.secure_url);
    }
    const mascotaActualizada = await this.mascotaModel.findByIdAndUpdate(
      id,
      { ...updateMascotaDto, galeriaFotos: galeriaFotosUrls },
      { new: true },
    );
    if (!mascotaActualizada) {
      throw new NotFoundException(`Error al actualizar la mascota con ID "${id}".`);
    }
    return mascotaActualizada;
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.solicitudModel.deleteMany({ mascota: id });
    await this.favoritoModel.deleteMany({ mascota: id });
    const result = await this.mascotaModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Mascota con ID "${id}" no encontrada.`);
    }
    return { message: `Mascota con ID "${id}" y todos sus datos asociados fueron eliminados.` };
  }
}