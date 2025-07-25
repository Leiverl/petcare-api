import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Mascota } from '../mascotas/schemas/mascota.schema';
import { CreateSolicitudAdopcionDto } from './dto/create-solicitudes-adopcion.dto';
import { UpdateSolicitudAdopcionDto } from './dto/update-solicitudes-adopcion.dto';
import { SolicitudAdopcion } from './schemas/solicitud-adopcion.schema';
import * as streamifier from 'streamifier';
import { PdfService } from '../pdf/pdf.service';
import { EmailService } from '../email/email.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Usuario } from '../usuarios/schemas/usuario.schema';
import { Refugio } from '../refugios/schemas/refugio.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { ConversacionesService } from '../conversaciones/conversaciones.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
@Injectable()
export class SolicitudesAdopcionService {
  constructor(
    @InjectModel(SolicitudAdopcion.name) private solicitudModel: Model<SolicitudAdopcion>,
    @InjectModel(Mascota.name) private mascotaModel: Model<Mascota>,
    @InjectModel(Refugio.name) private refugioModel: Model<Refugio>,
    private pdfService: PdfService,
    private emailService: EmailService,
    private cloudinaryService: CloudinaryService,
    private notificationsService: NotificationsService,
    private conversacionesService: ConversacionesService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createDto: CreateSolicitudAdopcionDto, adoptanteId: string): Promise<SolicitudAdopcion> {
    const mascota = await this.mascotaModel.findById(createDto.mascota).populate({
      path: 'refugio',
      populate: { path: 'propietario' }
    });

    if (!mascota) {
      throw new NotFoundException(`Mascota con ID "${createDto.mascota}" no encontrada.`);
    }
    if (mascota.estado !== 'DISPONIBLE') {
      throw new BadRequestException(`La mascota "${mascota.nombre}" no está disponible para adopción.`);
    }

    const nuevaSolicitud = new this.solicitudModel({
      ...createDto,
      adoptante: adoptanteId,
    });
    await nuevaSolicitud.save();

    const refugioPropietarioId = (mascota.refugio as any).propietario._id;

    // --- CORRECCIÓN AQUÍ ---
    await this.conversacionesService.create({
      solicitudAdopcion: (nuevaSolicitud as any)._id.toString(),
      participantes: [adoptanteId, refugioPropietarioId.toString()]
    });
    
    mascota.estado = 'EN_PROCESO';
    await mascota.save();

    return nuevaSolicitud;
  }

  async findAllForUser(adoptanteId: string): Promise<SolicitudAdopcion[]> {
    return this.solicitudModel
      .find({ adoptante: adoptanteId })
      .populate('mascota')
      .populate('conversacion') // <-- AÑADIR ESTA LÍNEA
      .exec();
  }

  async findOne(id: string): Promise<SolicitudAdopcion> {
    const solicitud = await this.solicitudModel.findById(id)
      .populate('adoptante', 'nombre')
      .populate({ // Usamos populate anidado
        path: 'mascota',
        populate: {
          path: 'refugio',
          select: 'nombre' // Solo necesitamos el nombre del refugio
        }
      });
      
    if(!solicitud) {
      throw new NotFoundException(`Solicitud con ID "${id}" no encontrada.`);
    }
    return solicitud;
  }

  async updateStatus(id: string, updateDto: UpdateSolicitudAdopcionDto): Promise<SolicitudAdopcion> {
    const solicitud = await this.solicitudModel.findByIdAndUpdate(id, { estado: updateDto.estado }, { new: true })
      .populate('adoptante')
      .populate('mascota');

    if (!solicitud) throw new NotFoundException(`Solicitud con ID "${id}" no encontrada.`);

    const adoptante = solicitud.adoptante as any;
    
    // 1. Disparamos la notificación (esto es rápido)
    await this.notificationsService.createAndSend({
        userId: adoptante._id,
        title: 'Actualización de tu Solicitud',
        body: `El estado de tu solicitud para adoptar a ${ (solicitud.mascota as any).nombre } ha cambiado a: ${solicitud.estado}`,
        route: '/tabs/profile/applications'
    });
    
    // 2. Si se aprueba, disparamos un evento para el trabajo pesado en segundo plano
    if (updateDto.estado === 'APROBADA') {
      await this.mascotaModel.findByIdAndUpdate(solicitud.mascota, { estado: 'ADOPTADA' });
      this.eventEmitter.emit('adoption.approved', solicitud);
    }

    if (updateDto.estado === 'RECHAZADA') {
      await this.mascotaModel.findByIdAndUpdate(solicitud.mascota, { estado: 'DISPONIBLE' });
    }

    // 3. Devolvemos la respuesta inmediatamente al frontend
    return solicitud;
  }
  // --- NUEVO MÉTODO QUE ESCUCHA EL EVENTO Y HACE EL TRABAJO PESADO ---
  @OnEvent('adoption.approved')
  async handleAdoptionApproved(solicitud: SolicitudAdopcion) {
    console.log(`[BackgroundTask] Iniciando proceso de aprobación para solicitud: ${solicitud._id}`);
    try {
      // Volvemos a popular los datos necesarios
      const populatedSolicitud = await this.solicitudModel.findById(solicitud._id).populate('adoptante').populate({
        path: 'mascota',
        populate: { path: 'refugio' }
      });
      if (!populatedSolicitud) return;

      const pdfBuffer = await this.pdfService.generarCertificadoAdopcion(populatedSolicitud);
      const pdfFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: `certificado-adopcion-${solicitud.id}.pdf`,
        mimetype: 'application/pdf',
        buffer: pdfBuffer,
        size: pdfBuffer.length,
        stream: streamifier.createReadStream(pdfBuffer),
        destination: '',
        filename: '',
        encoding: '7bit',
        path: ''
      };
      const uploadResult = await this.cloudinaryService.uploadFile(pdfFile);

      await this.solicitudModel.findByIdAndUpdate(solicitud._id, {
        urlPdfCertificado: uploadResult.secure_url,
      });

      await this.emailService.enviarCertificadoAdopcion(populatedSolicitud, pdfBuffer);
      console.log(`[BackgroundTask] Proceso de aprobación completado para solicitud: ${solicitud._id}`);
    } catch (error) {
      console.error(`[BackgroundTask] Error en el proceso de aprobación para solicitud ${solicitud._id}:`, error);
    }
  }
  
  async findAllForKanban(user: Usuario): Promise<SolicitudAdopcion[]> {
    const query = this.solicitudModel.find()
        .populate({ path: 'mascota', select: 'nombre galeriaFotos' })
        .populate({ path: 'adoptante', select: 'nombre correo' })
        .populate('conversacion');

    if (user.rol === 'ADMIN') {
      return query.exec();
    }

    if (user.rol === 'REFUGIO') {
      // --- CORRECCIÓN AQUÍ ---
      const refugioDelUsuario = await this.refugioModel.findOne({ propietario: user._id });
      if (!refugioDelUsuario) return [];
      const mascotasDelRefugio = await this.mascotaModel.find({ refugio: (refugioDelUsuario as any)._id }).select('_id');
      const idsDeMascotas = mascotasDelRefugio.map(m => m._id);
      return query.where('mascota').in(idsDeMascotas).exec();
    }
    return [];
  }

  async remove(id: string): Promise<{ message: string }> {
    // Usamos findById en lugar de findByIdAndDelete para poder leer el estado antes de borrar
    const solicitud = await this.solicitudModel.findById(id);
    if (!solicitud) {
      throw new NotFoundException(`Solicitud con ID "${id}" no encontrada.`);
    }
    
    // --- CORRECCIÓN AQUÍ ---
    // Si la solicitud estaba "activa" (Nueva, En Revisión o Aprobada), la mascota vuelve a estar disponible.
    if (['NUEVA', 'EN_REVISION', 'APROBADA'].includes(solicitud.estado)) {
      await this.mascotaModel.findByIdAndUpdate(solicitud.mascota, { estado: 'DISPONIBLE' });
    }

    // Ahora sí eliminamos la solicitud
    await this.solicitudModel.findByIdAndDelete(id);
    
    return { message: 'Solicitud eliminada exitosamente.' };
  }
}