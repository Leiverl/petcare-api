import { Injectable } from '@nestjs/common';
import { SolicitudAdopcion } from '../solicitudes-adopcion/schemas/solicitud-adopcion.schema';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PdfService {

  async generarCertificadoAdopcion(solicitud: SolicitudAdopcion): Promise<Buffer> {
    const adoptante: any = solicitud.adoptante;
    const mascota: any = solicitud.mascota;
    const refugio: any = mascota.refugio;
    const fechaAdopcion = new Date().toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    return new Promise(resolve => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        layout: 'portrait',
        info: {
          Title: `Certificado de Adopción - ${mascota.nombre}`,
          Author: 'PetCare',
        }
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // --- Construcción del PDF ---

      // Logo
      const logoPath = path.join(process.cwd(), 'src/assets/logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, {
          fit: [80, 80],
          align: 'center',
        }).moveDown(0.5);
      }
      
      // Título
      doc.font('Helvetica-Bold').fontSize(28).fillColor('#007bff').text('Certificado de Adopción', { align: 'center' });
      doc.moveDown(2);

      // Cuerpo del texto
      doc.font('Helvetica').fontSize(12).fillColor('#333333').text('Con inmensa alegría, el refugio', { align: 'center' });
      doc.font('Helvetica-Bold').fontSize(16).fillColor('#212529').text(refugio?.nombre || 'Equipo PetCare', { align: 'center' });
      doc.font('Helvetica').fontSize(12).fillColor('#333333').text('certifica que:', { align: 'center' });
      doc.moveDown(2);

      // Nombre del adoptante
      doc.font('Helvetica-Bold').fontSize(24).fillColor('#ff9900').text(adoptante.nombre, { align: 'center' });
      doc.moveDown(1);
      
      doc.font('Helvetica').fontSize(12).fillColor('#333333').text('ha completado exitosamente el proceso para adoptar a:', { align: 'center' });
      doc.moveDown(2);

      // Nombre de la mascota
      doc.font('Helvetica-Bold').fontSize(24).fillColor('#007bff').text(mascota.nombre, { align: 'center' });
      doc.moveDown(2);
      
      // Párrafo final
      doc.font('Helvetica').fontSize(12).fillColor('#333333').text(
        `Este acto de amor inicia una nueva vida llena de compañerismo, lealtad y felicidad. Agradecemos profundamente esta decisión de dar un hogar a quien más lo necesita.`,
        { align: 'center', indent: 20, lineGap: 5 }
      );

      // Pie de página
      const bottom = doc.page.margins.bottom;
      doc.font('Helvetica-Oblique').fontSize(10).fillColor('#6c757d');
      doc.text(`Fecha de Adopción: ${fechaAdopcion}`, 50, doc.page.height - bottom - 20, { align: 'left' });
      doc.text('Generado por PetCare', doc.page.width - 50 - 150, doc.page.height - bottom - 20, { align: 'right', width: 150 });
      
      doc.end();
    });
  }
}