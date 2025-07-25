import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MensajesService } from '../mensajes/mensajes.service';
import { ConversacionesService } from '../conversaciones/conversaciones.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Conversacion } from '../conversaciones/schemas/conversacion.schema';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private mensajesService: MensajesService,
    private conversacionesService: ConversacionesService,
    private notificationsService: NotificationsService
  ) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      client.join(userId);
      console.log(`Cliente conectado y unido a la sala: ${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('enviarMensaje')
  async handleMessage(client: Socket, payload: { conversacionId?: string, solicitudId?: string, texto: string }): Promise<void> {
    const remitenteId = client.handshake.query.userId as string;
    
    let conversacion: Conversacion | null = null;

    if (payload.conversacionId) {
      conversacion = await this.conversacionesService.findById(payload.conversacionId);
    } else if (payload.solicitudId) {
      conversacion = await this.conversacionesService.findBySolicitudId(payload.solicitudId);
    }

    if (!conversacion) return;

    const mensajeGuardado = await this.mensajesService.create({
      // --- CORRECCIÓN AQUÍ ---
      conversacion: (conversacion as any)._id.toString(),
      remitente: remitenteId,
      cuerpo: payload.texto,
    });

    const destinatarioId = conversacion.participantes.find(p => p.toString() !== remitenteId)?.toString();
    if (!destinatarioId) return;

    this.server.to(destinatarioId).emit('nuevoMensaje', mensajeGuardado);
    this.server.to(remitenteId).emit('nuevoMensaje', mensajeGuardado);
  }

  @SubscribeMessage('usuarioEscribiendo')
  async handleTyping(client: Socket, payload: { conversacionId?: string, solicitudId?: string }): Promise<void> {
    const remitenteId = client.handshake.query.userId as string;
    let conversacion: Conversacion | null = null;

    if (payload.conversacionId) {
      conversacion = await this.conversacionesService.findById(payload.conversacionId);
    } else if (payload.solicitudId) {
      conversacion = await this.conversacionesService.findBySolicitudId(payload.solicitudId);
    }

    if (!conversacion) return;

    const destinatarioId = conversacion.participantes.find(p => p.toString() !== remitenteId)?.toString();
    if (destinatarioId) {
      // --- CORRECCIÓN AQUÍ ---
      this.server.to(destinatarioId).emit('estaEscribiendo', { conversacionId: (conversacion as any)._id.toString() });
    }
  }
}