import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { Person } from './person.entity';
import { Document } from './document.entity';

export enum RequestStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum RequestType {
  UPDATE_PERSONAL_INFO = 'UPDATE_PERSONAL_INFO',
  UPDATE_ADDRESS = 'UPDATE_ADDRESS',
  UPDATE_CONTACT = 'UPDATE_CONTACT',
  CORRECT_DATA = 'CORRECT_DATA',
  ADD_DOCUMENT = 'ADD_DOCUMENT',
}

@Entity('change_requests')
export class ChangeRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  requestNumber: string; // Уникальный номер запроса

  @ManyToOne(() => Person, (person) => person.changeRequests)
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @Column()
  personId: string;

  @Column()
  submittedBy: string; // User ID, кто создал запрос

  @Column({
    type: 'enum',
    enum: RequestType,
  })
  requestType: RequestType;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @Column({ type: 'jsonb' })
  requestedChanges: Record<string, any>; // JSON с запрошенными изменениями

  @Column({ type: 'jsonb', nullable: true })
  currentData: Record<string, any>; // Текущие данные (для сравнения)

  @Column({ type: 'text', nullable: true })
  description: string; // Описание запроса

  @Column({ nullable: true })
  assignedAgencyId: string; // Кому назначен запрос

  @Column({ nullable: true })
  processedBy: string; // Кто обработал (User ID)

  @Column({ type: 'text', nullable: true })
  processingNotes: string; // Комментарии оператора

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;

  @OneToMany(() => Document, (document) => document.changeRequest, {
    eager: true,
  })
  documents: Document[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
