import { Module, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { MulterModule } from '@nestjs/platform-express';
import { APP_PIPE } from '@nestjs/core';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { Document } from '../../database/entities/document.entity';
import * as multer from 'multer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document]),
    ConfigModule,
    PassportModule,
    MulterModule.register({
      storage: multer.memoryStorage(),   // <-- ВАЖНО: теперь файл имеет buffer
    }),
  ],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    { provide: APP_PIPE, useClass: ValidationPipe },
  ],
})
export class DocumentsModule {}
