import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

// Definimos los roles posibles para reutilizar
enum RolUsuario {
  ADOPTANTE = 'ADOPTANTE',
  REFUGIO = 'REFUGIO',
  ADMIN = 'ADMIN',
}

export class CreateUsuarioDto {
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({
    description: 'Correo electrónico único del usuario',
    example: 'juan.perez@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 8 caracteres)',
    example: 'ContrasenaSegura123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  contrasena: string;

  @ApiProperty({
    description: 'Rol del usuario dentro de la plataforma',
    enum: RolUsuario,
    default: RolUsuario.ADOPTANTE,
  })
  @IsEnum(RolUsuario)
  @IsOptional() // Hacemos que sea opcional, si no se envía, se usará el default del Schema
  rol?: RolUsuario;
}