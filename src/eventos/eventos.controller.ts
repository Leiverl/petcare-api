import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { EventosService } from './eventos.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('eventos')
@Controller('eventos')
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('REFUGIO', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo evento' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('imagenPrincipal'))
  create(@Body() createEventoDto: CreateEventoDto, @UploadedFile() file: Express.Multer.File, @Req() req) {
    return this.eventosService.create(createEventoDto, req.user, file);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard) // <-- AÑADIR GUARDIAS
  @Roles('ADMIN', 'REFUGIO', 'ADOPTANTE')              // <-- AÑADIR ROLES
  @ApiBearerAuth()                        // <-- AÑADIR
  @ApiOperation({ summary: 'Obtener la lista de eventos (filtrada por rol)' })
  findAll(@Req() req) { // <-- AÑADIR @Req y pasar el usuario
    return this.eventosService.findAll(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener el detalle de un evento específico (Público)' })
  findOne(@Param('id') id: string) {
    return this.eventosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('REFUGIO', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un evento' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('imagenPrincipal'))
  update(@Param('id') id: string, @Body() updateEventoDto: UpdateEventoDto, @Req() req, @UploadedFile() file?: Express.Multer.File) {
    return this.eventosService.update(id, req.user, updateEventoDto, file);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('REFUGIO', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un evento' })
  remove(@Param('id') id: string, @Req() req) {
    return this.eventosService.remove(id, req.user);
  }
}