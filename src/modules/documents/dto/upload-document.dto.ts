import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { DocumentType } from '../../../database/entities/document.entity';
import { Transform } from 'class-transformer';

export class UploadDocumentDto {
  @IsEnum(DocumentType)
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      // Map Russian names to enum
      const mapping: Record<string, DocumentType> = {
        'паспорт': DocumentType.PASSPORT,
        'паспорт гражданина': DocumentType.PASSPORT,
        'id_card': DocumentType.ID_CARD,
        'удостоверение личности': DocumentType.ID_CARD,
        'свидетельство о рождении': DocumentType.BIRTH_CERTIFICATE,
        'свидетельство о браке': DocumentType.MARRIAGE_CERTIFICATE,
        'справка о прописке': DocumentType.RESIDENCE_CERTIFICATE,
        'другое': DocumentType.OTHER,
      };
      return mapping[value.toLowerCase()] || DocumentType.OTHER;
    }
    return value;
  })
  documentType?: DocumentType;

  @IsString()
  @IsOptional()
  documentNumber?: string;

  @IsDateString()
  @IsOptional()
  issueDate?: string;

  @IsString()
  @IsOptional()
  issuedBy?: string;
}