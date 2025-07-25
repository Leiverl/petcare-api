import { Module } from '@nestjs/common';
import { RefugiosService } from './refugios.service';
import { RefugiosController } from './refugios.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Refugio, RefugioSchema } from './schemas/refugio.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Refugio.name,
        schema: RefugioSchema,
      },
    ]),
    CloudinaryModule,
  ],
  controllers: [RefugiosController],
  providers: [RefugiosService],
})
export class RefugiosModule {}