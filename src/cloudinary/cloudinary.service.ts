import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  uploadFile(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'petcare',
          timeout: 120000
         },
        (error, result) => {
          if (error) return reject(error);
          // Verificamos que 'result' no sea undefined antes de resolver
          if (!result) {
            return reject(new InternalServerErrorException('Fallo la subida a Cloudinary, no se recibió resultado.'));
          }
          resolve(result);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}