import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { Person } from '../../database/entities/person.entity';

@Controller('documents')
@UseGuards(AuthGuard('jwt-person'))
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: any,
    @Body() uploadDto: UploadDocumentDto,
    @Request() req: { user: Person },
  ) {
    return await this.documentsService.uploadDocument(req.user.psn, file, uploadDto);
  }

  @Get()
  async getDocuments(@Request() req: { user: Person }) {
    return await this.documentsService.getDocumentsByPsn(req.user.psn);
  }

  @Delete(':id')
  async deleteDocument(
    @Param('id') id: string,
    @Request() req: { user: Person },
  ) {
    await this.documentsService.deleteDocument(req.user.psn, id);
    return { message: 'Document deleted successfully' };
  }
}
