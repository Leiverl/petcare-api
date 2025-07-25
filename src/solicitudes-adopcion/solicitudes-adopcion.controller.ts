import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, Delete } from '@nestjs/common';
import { SolicitudesAdopcionService } from './solicitudes-adopcion.service';
import { CreateSolicitudAdopcionDto } from './dto/create-solicitudes-adopcion.dto';
import { UpdateSolicitudAdopcionDto } from './dto/update-solicitudes-adopcion.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('solicitudes-adopcion')
@ApiBearerAuth() // Todas las rutas de este controlador requieren autenticación
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('solicitudes-adopcion')
export class SolicitudesAdopcionController {
  constructor(private readonly solicitudesAdopcionService: SolicitudesAdopcionService) {}

  @Post()
  @Roles('ADOPTANTE')
  @ApiOperation({ summary: 'Crear una nueva solicitud de adopción (Solo ADOPTANTES)' })
  create(@Body() createSolicitudAdopcionDto: CreateSolicitudAdopcionDto, @Req() req) {
    // Obtenemos el ID del adoptante desde el token JWT
    const adoptanteId = req.user.id;
    return this.solicitudesAdopcionService.create(createSolicitudAdopcionDto, adoptanteId);
  }

  @Get('mis-solicitudes')
  @Roles('ADOPTANTE')
  @ApiOperation({ summary: 'Obtener las solicitudes del usuario logueado (Solo ADOPTANTES)' })
  findAllForUser(@Req() req) {
    const adoptanteId = req.user.id;
    return this.solicitudesAdopcionService.findAllForUser(adoptanteId);
  }
  @Get() // <-- NUEVA RUTA GET EN LA RAÍZ
  @Roles('REFUGIO', 'ADMIN')
  @ApiOperation({ summary: 'Obtener todas las solicitudes para el Kanban (filtrado por rol)' })
  findAllForKanban(@Req() req) {
    return this.solicitudesAdopcionService.findAllForKanban(req.user);
  }
  
  @Get(':id')
  @Roles('ADOPTANTE', 'REFUGIO', 'ADMIN')
  @ApiOperation({ summary: 'Obtener el detalle de una solicitud (ADOPTANTE la suya, REFUGIO/ADMIN cualquiera)' })
  findOne(@Param('id') id: string) {
    // La lógica para verificar que el adoptante solo vea la suya iría en el servicio
    return this.solicitudesAdopcionService.findOne(id);
  }

  @Patch(':id/estado')
  @Roles('REFUGIO', 'ADMIN')
  @ApiOperation({ summary: 'Actualizar el estado de una solicitud (Solo REFUGIO o ADMIN)' })
  updateStatus(@Param('id') id: string, @Body() updateSolicitudAdopcionDto: UpdateSolicitudAdopcionDto) {
    return this.solicitudesAdopcionService.updateStatus(id, updateSolicitudAdopcionDto);
  }
  @Delete(':id')
  @Roles('REFUGIO', 'ADMIN')
  @ApiOperation({ summary: 'Eliminar una solicitud de adopción' })
  remove(@Param('id') id: string) {
    return this.solicitudesAdopcionService.remove(id);
  }
}