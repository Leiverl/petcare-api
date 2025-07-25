import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateMascotaDto {
  @ApiProperty() @IsString() @IsNotEmpty() nombre: string;
  @ApiProperty() @IsString() @IsNotEmpty() especie: string;
  @ApiProperty() @IsString() @IsNotEmpty() raza: string;
  
  @ApiProperty() 
  @Type(() => Number)
  @IsNumber() 
  @IsNotEmpty() 
  edad: number;

  @ApiProperty({ enum: ['MACHO', 'HEMBRA'] }) @IsEnum(['MACHO', 'HEMBRA']) @IsNotEmpty() sexo: 'MACHO' | 'HEMBRA';
  @ApiProperty() @IsString() @IsNotEmpty() tamano: string;
  @ApiProperty() @IsString() @IsNotEmpty() descripcion: string;
  
  @ApiProperty({ 
    type: 'object', 
    example: { vacunas: 'Completas', esterilizado: 'Sí' },
    // Añadimos esta propiedad para solucionar el error de Swagger
    additionalProperties: true,
  }) 
  @IsObject() 
  @IsOptional() 
  infoSalud: Record<string, any>;

   @ApiProperty({ required: false }) 
  @IsOptional() 
  @IsMongoId() 
  refugio: string;
}