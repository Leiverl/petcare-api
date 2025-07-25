import { Controller, Post, Body, Get, UseGuards, Param, Patch, Delete, Req  } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
@ApiTags('usuarios')
//@ApiBearerAuth()
//@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('disponibles/refugio')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener usuarios con rol REFUGIO sin refugio asignado (Solo ADMIN)' })
  findAvailableShelterUsers() {
    return this.usuariosService.findAvailableShelterUsers();
  }
  @Post('registro')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente.'})
  @ApiResponse({ status: 409, description: 'El correo electrónico ya está registrado.'})
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  // --- NUEVA RUTA PROTEGIDA ---
  //@Get() // La ruta final será GET /api/v1/usuarios
  //@ApiOperation({ summary: 'Obtener la lista de todos los usuarios (Ruta Protegida)' })
  //@ApiResponse({ status: 200, description: 'Lista de usuarios.'})
  //@ApiResponse({ status: 401, description: 'No autorizado.'})
  //@ApiBearerAuth() // Esto le dice a Swagger que esta ruta necesita un token
  //@UseGuards(AuthGuard('jwt')) // ¡Esta es la línea que protege la ruta!
  //findAll() {
    //return this.usuariosService.findAll();
  //}
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener la lista de todos los usuarios (Solo ADMIN)' })
  findAll() {
    return this.usuariosService.findAll();
  }

  // --- NUEVOS ENDPOINTS ---
  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener un usuario por ID (Solo ADMIN)' })
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  @Patch('mi-perfil')
  @UseGuards(AuthGuard('jwt')) // Protegido para cualquier usuario logueado
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar el perfil del usuario logueado' })
  updateProfile(@Req() req, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.updateProfile(req.user.id, updateUsuarioDto);
  }
  
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un usuario (Solo ADMIN)' })
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un usuario (Solo ADMIN)' })
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(id);
  }
}
