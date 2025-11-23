import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { AuditLog } from './audit-log.entity';

export enum UserRole {
  CITIZEN = 'CITIZEN',
  AGENCY_OPERATOR = 'AGENCY_OPERATOR',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude() // скрывает пароль при возврате через class-transformer
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CITIZEN,
  })
  role: UserRole;

  @Column({ nullable: true })
  agencyId: string; // для операторов агентства

  @Column({ nullable: false, unique: true })
  psn: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 'en' })
  locale: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => AuditLog, (auditLog) => auditLog.user)
  auditLogs: AuditLog[];
}
