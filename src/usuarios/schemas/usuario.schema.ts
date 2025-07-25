import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type RolUsuario = 'ADOPTANTE' | 'REFUGIO' | 'ADMIN';
@Schema({
  timestamps: true,
  toJSON: {
    // Añadimos el tipo 'any' al parámetro 'ret'
    transform: (doc, ret: any) => {
      delete ret.contrasena;
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    // Hacemos lo mismo aquí
    transform: (doc, ret: any) => {
       delete ret.contrasena;
       delete ret.__v;
       return ret;
    }
  }
})
export class Usuario extends Document {
  @Prop({ required: true, trim: true })
  nombre: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  correo: string;
  
  @Prop({ required: true, select: false }) // select: false evita que se devuelva por defecto
  contrasena: string;

  @Prop({
    required: true,
    enum: ['ADOPTANTE', 'REFUGIO', 'ADMIN'], // El enum se queda como está
    default: 'ADOPTANTE',
  })
  rol: RolUsuario;

  @Prop({ default: null })
  googleId?: string;
  
  @Prop({ default: null })
  fotoPerfil?: string;
  
  @Prop({ type: [String], default: [] })
  fcmTokens: string[];
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);