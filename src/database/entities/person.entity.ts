import { Address } from './address.entity';
import { ChangeRequest } from './change-request.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum CitizenshipStatus {
  CITIZEN = 'CITIZEN',
  PERMANENT_RESIDENT = 'PERMANENT_RESIDENT',
  TEMPORARY_RESIDENT = 'TEMPORARY_RESIDENT',
  REFUGEE = 'REFUGEE',
  ASYLUM_SEEKER = 'ASYLUM_SEEKER',
}

@Entity('persons')
export class Person {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 10 })
  psn: string; // Public Service Number - 10 digits

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  middleName: string; // Patronymic

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  placeOfBirth: string;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender;

  @Column({
    type: 'enum',
    enum: CitizenshipStatus,
    default: CitizenshipStatus.CITIZEN,
  })
  citizenshipStatus: CitizenshipStatus;

  @Column({ nullable: true })
  nationality: string;

  @Column({ nullable: true, type: 'text' })
  photo: string; 

  // Contact Information
  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: false, select: false })
  password: string;

  // Address will be in separate entity
  @OneToOne(() => Address, { eager: true, cascade: true })
  @JoinColumn()
  primaryAddress: Address;

  @OneToOne(() => Address, { eager: true, cascade: true })
  @JoinColumn()
  secondaryAddress: Address;

  // Relationships
  @OneToMany(() => ChangeRequest, (request) => request.person)
  changeRequests: ChangeRequest[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; 
}
