import { PartialType } from '@nestjs/swagger';
import { CreateInteraccionesEventoDto } from './create-interacciones-evento.dto';

export class UpdateInteraccionesEventoDto extends PartialType(CreateInteraccionesEventoDto) {}
