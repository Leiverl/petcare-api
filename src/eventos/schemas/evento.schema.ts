import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Refugio } from '../../refugios/schemas/refugio.schema';

@Schema({ timestamps: true })
export class Evento extends Document {
  @Prop({ required: true, trim: true })
  titulo: string;

  @Prop({ required: true, trim: true })
  descripcion: string;

  @Prop({ required: true })
  imagenPrincipal: string; // URL de la imagen en Cloudinary

  @Prop({ required: true, type: Date })
  fecha: Date;

  @Prop({ required: true, trim: true })
  hora: string;

  @Prop({ required: true, trim: true })
  ubicacion: string;

  @Prop({ required: true, trim: true })
  categoria: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Refugio', required: true })
  organizador: Refugio;
}

export const EventoSchema = SchemaFactory.createForClass(Evento);