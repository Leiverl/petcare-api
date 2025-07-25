import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Usuario } from '../../usuarios/schemas/usuario.schema';

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Refugio extends Document {
  @Prop({ required: true, trim: true })
  nombre: string;

  @Prop({ required: true })
  logo: string; // URL de la imagen en Cloudinary

  @Prop({ required: true, trim: true })
  direccion: string;

  @Prop({ type: String, required: true }) // Simulación simple de contacto
  infoContacto: string; 

  @Prop({ required: true })
  historia: string;

  // Relación con el usuario dueño del refugio
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Usuario', required: true })
  propietario: Usuario;
}

export const RefugioSchema = SchemaFactory.createForClass(Refugio);