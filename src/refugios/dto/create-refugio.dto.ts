import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl, IsMongoId } from 'class-validator';

export class CreateRefugioDto {
  @ApiProperty({ example: 'Patitas Felices' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  //@ApiProperty({ example: 'https://cloudinary.com/logo.png' })
  //@IsUrl()
  //@IsNotEmpty()
  //logo: string;

  @ApiProperty({ example: 'Av. Siempre Viva 123, Pasaje' })
  @IsString()
  @IsNotEmpty()
  direccion: string;

  @ApiProperty({ example: 'Teléfono: 0987654321' })
  @IsString()
  @IsNotEmpty()
  infoContacto: string;

  @ApiProperty({ example: 'Fundado en 2010 para...' })
  @IsString()
  @IsNotEmpty()
  historia: string;

  @ApiProperty({ description: 'ID del usuario con rol REFUGIO que administra este perfil.' })
  @IsMongoId()
  @IsNotEmpty()
  propietario: string;
}