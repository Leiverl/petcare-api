import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEventoDto {
  @ApiProperty() @IsString() @IsNotEmpty() titulo: string;
  @ApiProperty() @IsString() @IsNotEmpty() descripcion: string;
  
  @ApiProperty({ description: 'Fecha del evento en formato YYYY-MM-DD' })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @IsNotEmpty() 
  fecha: Date;
  
  @ApiProperty({ example: '10:00 AM' }) @IsString() @IsNotEmpty() hora: string;
  @ApiProperty() @IsString() @IsNotEmpty() ubicacion: string;
  @ApiProperty({ example: 'Jornada de Adopción' }) @IsString() @IsNotEmpty() categoria: string;
  
  @ApiProperty({ description: 'ID del refugio organizador. Requerido si el usuario es ADMIN.' }) 
  @IsMongoId() 
  @IsOptional() // Es opcional porque para un REFUGIO, se asigna automáticamente
  organizador?: string;
}