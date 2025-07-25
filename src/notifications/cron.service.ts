import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Evento } from '../eventos/schemas/evento.schema';
import { NotificationsService } from './notifications.service';

@Injectable()
export class CronService {
  constructor(
    @InjectModel(Evento.name) private eventoModel: Model<Evento>,
    private notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleEventReminders() {
    console.log('Ejecutando tarea de recordatorios de eventos...');
    const ahora = new Date();
    const manana = new Date(ahora);
    manana.setDate(manana.getDate() + 1);

    const proximosEventos = await this.eventoModel.find({ fecha: { $gte: ahora, $lt: manana } }).populate({
        path: 'interacciones',
        populate: { path: 'usuario' }
    });

    for (const evento of proximosEventos) {
      const interesados = (evento as any).interacciones;
      for (const interaccion of interesados) {
        const usuario = interaccion.usuario;
        if (usuario) {
          await this.notificationsService.createAndSend({
            userId: usuario._id,
            title: 'Recordatorio de Evento',
            body: `¡No lo olvides! El evento "${evento.titulo}" comienza mañana.`,
            route: `/tabs/events/${evento._id}`
          });
        }
      }
    }
  }
}