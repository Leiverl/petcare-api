import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Mascota } from '../../mascotas/schemas/mascota.schema';
import { Usuario } from '../../usuarios/schemas/usuario.schema';

export type EstadoSolicitud = 'NUEVA' | 'EN_REVISION' | 'APROBADA' | 'RECHAZADA';

@Schema({ timestamps: true, toJSON: { virtuals: true },
    toObject: { virtuals: true } })
export class SolicitudAdopcion extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Mascota', required: true })
  mascota: Mascota;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Usuario', required: true })
  adoptante: Usuario;

  @Prop({ required: true, enum: ['NUEVA', 'EN_REVISION', 'APROBADA', 'RECHAZADA'], default: 'NUEVA' })
  estado: EstadoSolicitud;

  @Prop({ type: Object })
  respuestasFormulario: Record<string, any>;

  @Prop({ default: null })
  urlPdfCertificado?: string;
}

export const SolicitudAdopcionSchema = SchemaFactory.createForClass(SolicitudAdopcion);

// --- AÑADIR ESTA SECCIÓN AL FINAL ---
SolicitudAdopcionSchema.virtual('conversacion', {
  ref: 'Conversacion',
  localField: '_id',
  foreignField: 'solicitudAdopcion',
  justOne: true, // Queremos solo un documento de conversación
});