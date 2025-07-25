import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFiles, Query  } from '@nestjs/common';
import { MascotasService } from './mascotas.service';
import { CreateMascotaDto } from './dto/create-mascota.dto';
import { UpdateMascotaDto } from './dto/update-mascota.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Req } from '@nestjs/common'; // Importar Req
@ApiTags('mascotas')
@Controller('mascotas')
export class MascotasController {
  constructor(private readonly mascotasService: MascotasService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('REFUGIO', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear el perfil de una nueva mascota (Solo REFUGIO o ADMIN)' })
  @ApiConsumes('multipart/form-data') // Indicamos que se consumirá form-data
  @ApiBody({
    description: 'Datos de la mascota y sus imágenes',
    schema: {
      type: 'object',
      properties: {
        nombre: { type: 'string' },
        especie: { type: 'string' },
        raza: { type: 'string' },
        edad: { type: 'number' },
        sexo: { type: 'string', enum: ['MACHO', 'HEMBRA'] },
        tamano: { type: 'string' },
        descripcion: { type: 'string' },
        refugio: { type: 'string' }, // Mongo ID
        galeriaFotos: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('galeriaFotos', 10)) // 'galeriaFotos' es el nombre del campo, 10 es el máximo de archivos
  create(@Body() createMascotaDto: CreateMascotaDto, @UploadedFiles() files: Array<Express.Multer.File>, @Req() req) {
    console.log('[Controller] Petición para crear mascota recibida.'); // <-- LOG 1
    console.log('[Controller] Archivos recibidos:', files.length);
    return this.mascotasService.create(createMascotaDto, req.user, files);
  }

  @Get()
  @UseGuards(AuthGuard('jwt')) // El AuthGuard es suficiente para obtener el usuario
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener la lista de mascotas (filtrada por rol)' })
  findAll(@Req() req, @Query() filters: any) {
    return this.mascotasService.findAll(req.user, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener los detalles de una mascota específica (Público)' })
  findOne(@Param('id') id: string) {
    // Este puede ser público o protegido, lo dejamos público por ahora
    return this.mascotasService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('REFUGIO', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una mascota (Solo REFUGIO o ADMIN)' })
  @ApiConsumes('multipart/form-data') // AÑADIR
  @UseInterceptors(FilesInterceptor('galeriaFotos', 10))
  update(
    @Param('id') id: string, 
    @Body() updateMascotaDto: UpdateMascotaDto,
    @UploadedFiles() files: Array<Express.Multer.File> // AÑADIR
  ) {
    return this.mascotasService.update(id, updateMascotaDto, files);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('REFUGIO', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una mascota (Solo REFUGIO o ADMIN)' })
  remove(@Param('id') id: string) {
    return this.mascotasService.remove(id);
  }
}