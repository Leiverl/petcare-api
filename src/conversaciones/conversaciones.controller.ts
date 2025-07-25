import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ConversacionesService } from './conversaciones.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('conversaciones')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('conversaciones')
export class ConversacionesController {
  constructor(private readonly conversacionesService: ConversacionesService) {}

  @Get(':id/mensajes')
  getHistorial(@Param('id') id: string) {
    return this.conversacionesService.getHistorial(id);
  }
}