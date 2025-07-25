import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Evento } from '../../eventos/schemas/evento.schema';
import { Usuario } from '../../usuarios/schemas/usuario.schema';

@Schema({ timestamps: true })
export class InteraccionEvento extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Usuario', required: true })
  usuario: Usuario;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Evento', required: true })
  evento: Evento;
}

export const InteraccionEventoSchema = SchemaFactory.createForClass(InteraccionEvento);
// Evita que un usuario se registre dos veces en el mismo evento
InteraccionEventoSchema.index({ usuario: 1, evento: 1 }, { unique: true });