import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { Document, DocumentType } from '../../database/entities/document.entity';
import { UploadDocumentDto } from './dto/upload-document.dto';

@Injectable()
export class DocumentsService {
  private minioClient: Minio.Client;

  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    private configService: ConfigService,
  ) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT')!,
      port: parseInt(this.configService.get<string>('MINIO_PORT')!),
      useSSL: false,
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY')!,
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY')!,
    });
  }

  async uploadDocument(
    psn: string,
    file: any, // Express.Multer.File
    uploadDto: UploadDocumentDto,
  ): Promise<Document> {
    if (!file) {
      console.log("file", file.buffer);
      throw new BadRequestException('File is required');
    }

    const bucket = this.configService.get<string>('MINIO_BUCKET')!;
    const fileName = `${psn}/${Date.now()}-${file.originalname}`;

    try {
      // Ensure bucket exists
      const bucketExists = await this.minioClient.bucketExists(bucket);
      if (!bucketExists) {
        await this.minioClient.makeBucket(bucket);
      }

      await this.minioClient.putObject(bucket, fileName, file.buffer, file.size, {
        'Content-Type': file.mimetype,
      });

      const document = this.documentRepository.create({
        fileName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        storagePath: `${bucket}/${fileName}`,
        documentType: uploadDto.documentType || DocumentType.OTHER,
        documentNumber: uploadDto.documentNumber,
        issueDate: uploadDto.issueDate ? new Date(uploadDto.issueDate) : undefined,
        issuedBy: uploadDto.issuedBy,
        psn,
      });

      return await this.documentRepository.save(document);
    } catch (error) {
      console.error('Upload error:', error);
      throw new BadRequestException(`Failed to upload document: ${error.message}`);
    }
  }

  async getDocumentsByPsn(psn: string): Promise<Document[]> {
    return await this.documentRepository.find({
      where: { psn },
      order: { uploadedAt: 'DESC' },
    });
  }

  async deleteDocument(psn: string, documentId: string): Promise<void> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId, psn },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const bucket = this.configService.get<string>('MINIO_BUCKET')!;
    const objectName = document.fileName;

    try {
      // Delete from MinIO
      await this.minioClient.removeObject(bucket, objectName);

      // Delete from database
      await this.documentRepository.remove(document);
    } catch (error) {
      throw new BadRequestException('Failed to delete document');
    }
  }
}
