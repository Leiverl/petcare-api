import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { EstadoSolicitud } from '../schemas/solicitud-adopcion.schema';

export class UpdateSolicitudAdopcionDto {
  @ApiProperty({
    description: 'Nuevo estado de la solicitud.',
    enum: ['NUEVA', 'EN_REVISION', 'APROBADA', 'RECHAZADA'],
  })
  @IsEnum(['NUEVA', 'EN_REVISION', 'APROBADA', 'RECHAZADA'])
  @IsNotEmpty()
  estado: EstadoSolicitud;
}