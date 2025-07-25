import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRefugioDto } from './dto/create-refugio.dto';
import { UpdateRefugioDto } from './dto/update-refugio.dto';
import { Refugio } from './schemas/refugio.schema';
import { Usuario } from '../usuarios/schemas/usuario.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
@Injectable()
export class RefugiosService {
  constructor(
    @InjectModel(Refugio.name) private refugioModel: Model<Refugio>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(createRefugioDto: CreateRefugioDto, file: Express.Multer.File): Promise<Refugio> {
    if (!file) {
      throw new NotFoundException('Se requiere un logo para el refugio.');
    }
    const uploadResult = await this.cloudinaryService.uploadFile(file);
    
    const nuevoRefugio = new this.refugioModel({
      ...createRefugioDto,
      logo: uploadResult.secure_url,
    });
    return nuevoRefugio.save();
  }

  async findAll(): Promise<Refugio[]> {
    return this.refugioModel.find().populate('propietario').exec();
  }

  async findOne(id: string): Promise<Refugio> {
    const refugio = await this.refugioModel.findById(id).populate('propietario').exec();
    if (!refugio) {
      throw new NotFoundException(`Refugio con ID "${id}" no encontrado.`);
    }
    return refugio;
  }

  async update(id: string, updateRefugioDto: UpdateRefugioDto, file?: Express.Multer.File): Promise<Refugio> {
    const refugioExistente = await this.refugioModel.findByIdAndUpdate(
      id,
      updateRefugioDto,
      { new: true }, // Devuelve el documento actualizado
    );
    if (!refugioExistente) {
      throw new NotFoundException(`Refugio con ID "${id}" no encontrado.`);
    }
    return refugioExistente;
  }
  async findMyProfile(user: Usuario): Promise<Refugio> {
    const refugio = await this.refugioModel.findOne({ propietario: user._id });
    if (!refugio) {
      throw new NotFoundException('Este usuario no tiene un perfil de refugio asociado.');
    }
    return refugio;
  }
  async remove(id: string): Promise<{ message: string }> {
    const result = await this.refugioModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Refugio con ID "${id}" no encontrado.`);
    }
    return { message: `Refugio con ID "${id}" eliminado exitosamente.` };
  }
}