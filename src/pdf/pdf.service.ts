import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { SolicitudAdopcion } from '../solicitudes-adopcion/schemas/solicitud-adopcion.schema';

@Injectable()
export class PdfService implements OnModuleDestroy {
  private browser: puppeteer.Browser | null = null;

  // --- MÉTODO DE INICIALIZACIÓN MANUAL ---
  // Este método será llamado desde main.ts para asegurar que Puppeteer esté listo.
  async init() {
    console.log('[PdfService] Inicializando instancia de Puppeteer...');
    this.browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // Previene errores en entornos con memoria compartida limitada
        '--single-process'       // A veces ayuda en entornos restringidos
      ],
    });
    console.log('[PdfService] Instancia de Puppeteer lista.');
  }

  // Se ejecuta cuando la aplicación se apaga para limpiar
  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async generarCertificadoAdopcion(solicitud: SolicitudAdopcion): Promise<Buffer> {
    if (!this.browser) {
      throw new Error('El servicio de PDF no se ha inicializado correctamente.');
    }

    const adoptante: any = solicitud.adoptante;
    const mascota: any = solicitud.mascota;
    const refugio: any = mascota.refugio;
    const fechaAdopcion = new Date().toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <title>Certificado de Adopción - PetCare</title>
          <style>
              @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Dancing+Script:wght@700&display=swap');
              
              body { font-family: 'Merriweather', serif; color: #333; background-color: #fdfdfa; margin: 0; padding: 0; }
              .certificate-container { border: 10px double #c0a062; padding: 40px; width: 210mm; height: 297mm; box-sizing: border-box; margin: auto; position: relative; display: flex; flex-direction: column; align-items: center; text-align: center; }
              .header { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
              .header-logo { font-size: 50px; }
              .header-title { font-size: 2rem; font-weight: bold; color: #0056b3; }
              .main-title { font-family: 'Dancing Script', cursive; font-size: 56px; color: #0056b3; margin: 20px 0; }
              p { font-size: 16px; line-height: 1.6; margin: 10px 0; }
              .adopter-name { font-family: 'Dancing Script', cursive; font-size: 42px; color: #d35400; margin: 20px 0; border-bottom: 2px solid #c0a062; display: inline-block; padding-bottom: 5px; }
              .pet-photo-container { margin: 25px 0; }
              .pet-photo { width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 5px solid #c0a062; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
              .pet-name { font-size: 32px; font-weight: bold; color: #0056b3; margin-top: 10px; }
              .footer { margin-top: auto; width: 100%; display: flex; justify-content: space-between; align-items: flex-end; }
              .seal { font-size: 80px; color: #c0a062; opacity: 0.8; }
              .signature { text-align: center; }
              .signature-line { border-top: 2px solid #333; padding-top: 5px; font-weight: bold; min-width: 200px; }
          </style>
      </head>
      <body>
          <div class="certificate-container">
              <div class="header">
                  <span class="header-logo">🐾</span>
                  <span class="header-title">PetCare</span>
              </div>
              <h1 class="main-title">Certificado de Adopción</h1>
              <p>Con inmensa alegría, se certifica que:</p>
              <div class="adopter-name">${adoptante.nombre}</div>
              <p>ha abierto las puertas de su hogar y de su corazón para adoptar a:</p>
              
              <div class="pet-photo-container">
                <img src="${mascota.galeriaFotos[0]}" alt="Foto de ${mascota.nombre}" class="pet-photo">
                <div class="pet-name">${mascota.nombre}</div>
              </div>
              
              <p>Este acto de amor inicia una nueva vida llena de compañerismo, lealtad y felicidad. <br>¡Gracias por cambiar un mundo!</p>
              
              <div class="footer">
                <div class="seal">🏅</div>
                <div class="signature">
                  <div class="signature-line">${refugio?.nombre || 'Equipo PetCare'}</div>
                  <small>Refugio Responsable</small>
                </div>
                <div class="signature">
                  <div class="signature-line">${fechaAdopcion}</div>
                  <small>Fecha de Adopción</small>
                </div>
              </div>
          </div>
      </body>
      </html>
    `;
    
    const page = await this.browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    
    await page.close();
    
    return Buffer.from(pdfBuffer);
  }
}