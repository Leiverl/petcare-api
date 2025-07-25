import { Controller, Get, Post, Body, Param, UseGuards, Req, Delete, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('notificaciones')
@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('mis-notificaciones')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  getMisNotificaciones(@Req() req) {
    return this.notificationsService.getMisNotificaciones(req.user.id);
  }
  
  @Post('manual/evento/:eventoId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'REFUGIO')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enviar notificación manual a interesados en un evento' })
  sendManual(
    @Param('eventoId') eventoId: string,
    @Body() body: { titulo: string, cuerpo: string }
  ) {
    return this.notificationsService.sendManualNotificationToEventAttendees(eventoId, body.titulo, body.cuerpo);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  remove(@Param('id') id: string, @Req() req) {
    return this.notificationsService.remove(id, req.user.id);
  }
  @Patch(':id/leida')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    markAsRead(@Param('id') id: string, @Req() req) {
        return this.notificationsService.markAsRead(id, req.user.id);
    }

    @Post('marcar-todas-leidas')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    markAllAsRead(@Req() req) {
        return this.notificationsService.markAllAsRead(req.user.id);
    }
}