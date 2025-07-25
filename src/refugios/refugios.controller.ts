import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { RefugiosService } from './refugios.service';
import { CreateRefugioDto } from './dto/create-refugio.dto';
import { UpdateRefugioDto } from './dto/update-refugio.dto';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('refugios')
@Controller('refugios')
export class RefugiosController {
  constructor(private readonly refugiosService: RefugiosService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo perfil de refugio (Solo ADMINS)' })
  @ApiConsumes('multipart/form-data') // <-- Añadir
  @UseInterceptors(FileInterceptor('logo')) // <-- Añadir
  create(
    @Body() createRefugioDto: CreateRefugioDto,
    @UploadedFile() file: Express.Multer.File // <-- Añadir
  ) {
    return this.refugiosService.create(createRefugioDto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener la lista de todos los refugios (Público)' })
  findAll() {
    return this.refugiosService.findAll();
  }

  // --- RUTA ESPECÍFICA PRIMERO ---
  @Get('mi-perfil')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('REFUGIO')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener el perfil del refugio del usuario logueado (Solo REFUGIO)' })
  findMyProfile(@Req() req) {
    return this.refugiosService.findMyProfile(req.user);
  }

  // --- RUTA GENÉRICA DESPUÉS ---
  @Get(':id')
  @ApiOperation({ summary: 'Obtener los detalles de un refugio específico (Público)' })
  findOne(@Param('id') id: string) {
    return this.refugiosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'REFUGIO')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un refugio' })
  @ApiConsumes('multipart/form-data') // <-- Añadir
  @UseInterceptors(FileInterceptor('logo'))
  update(
    @Param('id') id: string, 
    @Body() updateRefugioDto: UpdateRefugioDto,
    @UploadedFile() file?: Express.Multer.File // <-- Añadir
  ) {
    return this.refugiosService.update(id, updateRefugioDto, file);
  }
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un refugio (Solo ADMINS)' })
  remove(@Param('id') id: string) {
    return this.refugiosService.remove(id);
  }
}