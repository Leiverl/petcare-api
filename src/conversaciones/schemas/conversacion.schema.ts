import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { SolicitudAdopcion } from '../../solicitudes-adopcion/schemas/solicitud-adopcion.schema';
import { Usuario } from '../../usuarios/schemas/usuario.schema';

@Schema({ timestamps: true })
export class Conversacion extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'SolicitudAdopcion', required: true, unique: true })
  solicitudAdopcion: SolicitudAdopcion;

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Usuario' }])
  participantes: Usuario[];
}

export const ConversacionSchema = SchemaFactory.createForClass(Conversacion);