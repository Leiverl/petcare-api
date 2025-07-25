import { Controller, Get, Post, Delete, Param, UseGuards, Req, Body } from '@nestjs/common';
import { InteraccionesEventosService } from './interacciones-eventos.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('interacciones-eventos')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('interacciones-eventos')
export class InteraccionesEventosController {
  constructor(private readonly interaccionesService: InteraccionesEventosService) {}

  @Post()
  addInteres(@Body('eventoId') eventoId: string, @Req() req) {
    return this.interaccionesService.addInteres(req.user.id, eventoId);
  }

  @Delete(':eventoId')
  removeInteres(@Param('eventoId') eventoId: string, @Req() req) {
    return this.interaccionesService.removeInteres(req.user.id, eventoId);
  }

  @Get('mis-eventos')
  getMisEventos(@Req() req) {
    return this.interaccionesService.getMisEventos(req.user.id);
  }

  @Get('status/:eventoId')
  checkInteres(@Param('eventoId') eventoId: string, @Req() req) {
    return this.interaccionesService.checkInteres(req.user.id, eventoId);
  }

  @Get('por-evento/:eventoId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'REFUGIO')
  getInteresadosPorEvento(@Param('eventoId') eventoId: string) {
    return this.interaccionesService.getInteresadosPorEvento(eventoId);
  }
}