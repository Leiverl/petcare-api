import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsObject } from 'class-validator';

export class CreateSolicitudAdopcionDto {
  @ApiProperty({ description: 'ID de la mascota que se desea adoptar.' })
  @IsMongoId()
  @IsNotEmpty()
  mascota: string;

  @ApiProperty({ 
    description: 'Respuestas al cuestionario de adopción.',
    example: { pregunta1: 'Respuesta 1', pregunta2: 'Respuesta 2' }
  })
  @IsObject()
  @IsNotEmpty()
  respuestasFormulario: Record<string, any>;
}