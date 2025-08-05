import { Controller, Get, Post, Param, UseGuards, Req, Body } from '@nestjs/common';
import { InteraccionesEventosService } from './interacciones-eventos.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { IsMongoId, IsNotEmpty } from 'class-validator'; // <-- IMPORT VALIDATORS

// DTO para validar el body del POST
class ToggleInteresDto {
  @IsMongoId()      // <-- ADD VALIDATOR
  @IsNotEmpty()     // <-- ADD VALIDATOR
  eventoId: string;
}

@ApiTags('interacciones-eventos')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('interacciones-eventos')
export class InteraccionesEventosController {
  constructor(private readonly interaccionesService: InteraccionesEventosService) {}

  @Post()
  @ApiOperation({ summary: 'Marcar o desmarcar interés en un evento (toggle)' })
  toggleInteres(@Body() toggleInteresDto: ToggleInteresDto, @Req() req) {
    return this.interaccionesService.toggleInteres(req.user.id, toggleInteresDto.eventoId);
  }

  // ... (the rest of your controller methods are fine and do not need changes)
  
  @Get('mis-eventos')
  @ApiOperation({ summary: 'Obtener los eventos de interés del usuario logueado' })
  getMisEventos(@Req() req) {
    return this.interaccionesService.getMisEventos(req.user.id);
  }

  @Get('status/:eventoId')
  @ApiOperation({ summary: 'Verificar si el usuario está interesado en un evento' })
  checkInteres(@Param('eventoId') eventoId: string, @Req() req) {
    return this.interaccionesService.checkInteres(req.user.id, eventoId);
  }

  @Get('por-evento/:eventoId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'REFUGIO')
  @ApiOperation({ summary: 'Obtener la lista de usuarios interesados en un evento' })
  getInteresadosPorEvento(@Param('eventoId') eventoId: string) {
    return this.interaccionesService.getInteresadosPorEvento(eventoId);
  }
}