import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Refugio } from '../../refugios/schemas/refugio.schema';

export type EstadoMascota = 'DISPONIBLE' | 'EN_PROCESO' | 'ADOPTADA';
export type SexoMascota = 'MACHO' | 'HEMBRA';

@Schema({ timestamps: true })
export class Mascota extends Document {
  @Prop({ required: true, trim: true })
  nombre: string;

  @Prop({ required: true, trim: true })
  especie: string;

  @Prop({ required: true, trim: true })
  raza: string;

  @Prop({ required: true })
  edad: number;

  @Prop({ required: true, enum: ['MACHO', 'HEMBRA'] })
  sexo: SexoMascota;

  @Prop({ required: true })
  tamano: string;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ type: Object }) // Puede ser un objeto con { vacunas: [], etc. }
  infoSalud: Record<string, any>;

  @Prop({ required: true, enum: ['DISPONIBLE', 'EN_PROCESO', 'ADOPTADA'], default: 'DISPONIBLE' })
  estado: EstadoMascota;

  @Prop({ type: [String], required: true })
  galeriaFotos: string[]; // Array de URLs de Cloudinary

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Refugio', required: true })
  refugio: Refugio;
}

export const MascotaSchema = SchemaFactory.createForClass(Mascota);