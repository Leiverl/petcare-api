import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { FavoritosService } from './favoritos.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('favoritos')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('favoritos')
export class FavoritosController {
  constructor(private readonly favoritosService: FavoritosService) {}

  @Get('mis-favoritos')
  getMisFavoritos(@Req() req) {
    return this.favoritosService.getMisFavoritos(req.user.id);
  }

  @Post()
  addFavorito(@Body('mascotaId') mascotaId: string, @Req() req) {
    return this.favoritosService.addFavorito(req.user.id, mascotaId);
  }

  @Delete(':mascotaId')
  removeFavorito(@Param('mascotaId') mascotaId: string, @Req() req) {
    return this.favoritosService.removeFavorito(req.user.id, mascotaId);
  }
}