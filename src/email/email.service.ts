import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// --- CORRECCIÓN EN LA IMPORTACIÓN ---
import sgMail from '@sendgrid/mail';
import { SolicitudAdopcion } from '../solicitudes-adopcion/schemas/solicitud-adopcion.schema';

@Injectable()
export class EmailService {
  private verifiedEmail: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    const verifiedEmailFromEnv = this.configService.get<string>('SENDGRID_VERIFIED_EMAIL');

    if (!apiKey || !verifiedEmailFromEnv) {
      throw new Error('Las variables de entorno de SendGrid no están definidas. Revisa tu archivo .env');
    }
    
    this.verifiedEmail = verifiedEmailFromEnv;
    
    sgMail.setApiKey(apiKey);
  }

  async enviarCertificadoAdopcion(solicitud: SolicitudAdopcion, pdfBuffer: Buffer) {
    const adoptante: any = solicitud.adoptante;
    const mascota: any = solicitud.mascota;

    const msg = {
      to: adoptante.correo,
      from: this.verifiedEmail,
      subject: `¡Felicidades! Tu adopción de ${mascota.nombre} ha sido aprobada`,
      html: `
        <h1>¡Enhorabuena, ${adoptante.nombre}!</h1>
        <p>Nos llena de alegría informarte que tu solicitud para adoptar a <strong>${mascota.nombre}</strong> ha sido aprobada.</p>
        <p>Adjunto encontrarás tu certificado de adopción oficial. ¡Gracias por darle un hogar a quien más lo necesita!</p>
        <br>
        <p>Atentamente,</p>
        <p>El equipo de PetCare</p>
      `,
      attachments: [
        {
          content: pdfBuffer.toString('base64'),
          filename: `certificado-adopcion-${mascota.nombre}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ],
    };

    try {
      await sgMail.send(msg);
      console.log('Correo enviado exitosamente a través de SendGrid.');
    } catch (error) {
      console.error('Error enviando correo con SendGrid:', error.response?.body || error);
    }
  }
}