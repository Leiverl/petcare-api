import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Usuario } from '../../usuarios/schemas/usuario.schema';

interface JwtPayload {
  id: string;
  correo: string;
  rol: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
    configService: ConfigService,
  ) {
    // Obtenemos el secreto y verificamos que exista
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET no está definido en el archivo .env. La aplicación no puede iniciar.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Usamos la variable 'secret' que ya sabemos que es un string
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<Usuario> {
    const { id } = payload;
    
    const usuario = await this.usuarioModel.findById(id);

    if (!usuario) {
      throw new UnauthorizedException('Token inválido o usuario no encontrado.');
    }

    return usuario;
  }
}