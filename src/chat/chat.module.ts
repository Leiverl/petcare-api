import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { MensajesModule } from '../mensajes/mensajes.module';
import { ConversacionesModule } from '../conversaciones/conversaciones.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [MensajesModule, ConversacionesModule, NotificationsModule],
  providers: [ChatGateway],
})
export class ChatModule {}