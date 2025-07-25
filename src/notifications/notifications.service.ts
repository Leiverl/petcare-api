import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as admin from 'firebase-admin';
import * as path from 'path';
import { Notificacion } from './schemas/notificacion.schema';
import { Usuario } from '../usuarios/schemas/usuario.schema';
import { Evento } from '../eventos/schemas/evento.schema';
import { InteraccionEvento } from '../interacciones-eventos/schemas/interaccion-evento.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notificacion.name) private notificacionModel: Model<Notificacion>,
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
    @InjectModel(InteraccionEvento.name) private interaccionModel: Model<InteraccionEvento>,
  ) {
    if (admin.apps.length === 0) {
      const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
      });
    }
  }

  // MÉTODO PRINCIPAL
  async createAndSend(payload: { userId: string, title: string, body: string, route?: string }) {
    // 1. Guardar la notificación en la base de datos
    const notificacionGuardada = await new this.notificacionModel({
      usuario: payload.userId,
      titulo: payload.title,
      cuerpo: payload.body,
      ruta: payload.route,
    }).save();

    // 2. Enviar la notificación push
    const targetUser = await this.usuarioModel.findById(payload.userId).select('fcmTokens');
    if (targetUser && targetUser.fcmTokens.length > 0) {
      const message: admin.messaging.MulticastMessage = {
        tokens: targetUser.fcmTokens,
        notification: { title: payload.title, body: payload.body },
        data: { route: payload.route || '' }
      };
      await admin.messaging().sendEachForMulticast(message);
    }
    return notificacionGuardada;
  }

  // MÉTODO PARA EL HISTORIAL DE LA APP MÓVIL
  async getMisNotificaciones(userId: string): Promise<Notificacion[]> {
    return this.notificacionModel.find({ usuario: userId }).sort({ createdAt: -1 }).limit(50).exec();
  }
  
  // MÉTODO PARA EL ENVÍO MANUAL DESDE EL PANEL DE ADMIN
  async sendManualNotificationToEventAttendees(eventoId: string, titulo: string, cuerpo: string) {
    const interacciones = await this.interaccionModel.find({ evento: eventoId });
    const userIds = interacciones.map(i => i.usuario);

    // Enviamos una notificación a cada usuario interesado
    for (const userId of userIds) {
      await this.createAndSend({
        userId: userId.toString(),
        title: titulo,
        body: cuerpo,
        route: `/tabs/events/${eventoId}`
      });
    }
    return { message: `Notificaciones enviadas a ${userIds.length} usuarios.` };
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const result = await this.notificacionModel.deleteOne({ _id: id, usuario: userId });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Notificación no encontrada o no tienes permiso para eliminarla.');
    }
    return { message: 'Notificación eliminada.' };
  }
  async markAsRead(id: string, userId: string) {
    const result = await this.notificacionModel.updateOne(
      { _id: id, usuario: userId },
      { leida: true }
    );
    if (result.modifiedCount === 0) throw new NotFoundException('Notificación no encontrada.');
    return { message: 'Notificación marcada como leída.' };
  }

  async markAllAsRead(userId: string) {
    await this.notificacionModel.updateMany(
      { usuario: userId, leida: false },
      { leida: true }
    );
    return { message: 'Todas las notificaciones marcadas como leídas.' };
  }
}