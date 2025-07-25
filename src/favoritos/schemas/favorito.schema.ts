import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Mascota } from '../../mascotas/schemas/mascota.schema';
import { Usuario } from '../../usuarios/schemas/usuario.schema';

@Schema({ timestamps: true })
export class Favorito extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Usuario', required: true })
  usuario: Usuario;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Mascota', required: true })
  mascota: Mascota;
}

export const FavoritoSchema = SchemaFactory.createForClass(Favorito);