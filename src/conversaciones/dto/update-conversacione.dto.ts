import { PartialType } from '@nestjs/swagger';
import { CreateConversacioneDto } from './create-conversacione.dto';

export class UpdateConversacioneDto extends PartialType(CreateConversacioneDto) {}
