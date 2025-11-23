import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { ChangeRequest } from './change-request.entity';

export enum DocumentType {
  PASSPORT = 'PASSPORT',
  ID_CARD = 'ID_CARD',
  BIRTH_CERTIFICATE = 'BIRTH_CERTIFICATE',
  MARRIAGE_CERTIFICATE = 'MARRIAGE_CERTIFICATE',
  RESIDENCE_CERTIFICATE = 'RESIDENCE_CERTIFICATE',
  OTHER = 'OTHER',
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fileName: string;

  @Column()
  originalName: string;

  @Column()
  mimeType: string;

  @Column()
  fileSize: number; // В байтах

  @Column()
  storagePath: string; // Путь в MinIO

  @Column({
    type: 'enum',
    enum: DocumentType,
    default: DocumentType.OTHER,
  })
  documentType: DocumentType;

  @Column({ nullable: true })
  documentNumber: string;

  @Column({ type: 'date', nullable: true })
  issueDate: Date;

  @Column({ nullable: true })
  issuedBy: string;

  @ManyToOne(() => ChangeRequest, (request) => request.documents)
  @JoinColumn({ name: 'change_request_id' })
  changeRequest: ChangeRequest;

  @Column({ nullable: true })
  changeRequestId: string;

  @Column()
  psn: string; // Public Service Number

  @CreateDateColumn()
  uploadedAt: Date;
}
