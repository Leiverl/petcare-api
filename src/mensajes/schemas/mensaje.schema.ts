import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Conversacion } from '../../conversaciones/schemas/conversacion.schema';
import { Usuario } from '../../usuarios/schemas/usuario.schema';

@Schema({ timestamps: true })
export class Mensaje extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Conversacion', required: true, index: true })
  conversacion: Conversacion;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Usuario', required: true })
  remitente: Usuario; // Quien envía

  @Prop({ required: true, trim: true })
  cuerpo: string;

  @Prop({ default: false })
  leido: boolean;
}

export const MensajeSchema = SchemaFactory.createForClass(Mensaje);