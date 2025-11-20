import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  addressCode: string; // Cadastre system code

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  street: string;

  @Column({ nullable: true })
  building: string;

  @Column({ nullable: true })
  apartment: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ type: 'text', nullable: true })
  fullAddress: string;

  @Column({ type: 'jsonb', nullable: true })
  coordinates: { lat: number; lng: number };
}
