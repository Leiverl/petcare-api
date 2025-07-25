import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Usuario } from '../../usuarios/schemas/usuario.schema';

@Schema({ timestamps: true })
export class Notificacion extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Usuario', required: true, index: true })
  usuario: Usuario;

  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true })
  cuerpo: string;

  @Prop({ default: false })
  leida: boolean;

  @Prop({ default: null })
  ruta?: string;
}
export const NotificacionSchema = SchemaFactory.createForClass(Notificacion);