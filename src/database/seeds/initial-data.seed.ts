import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';
import { Person, Gender, CitizenshipStatus } from '../entities/person.entity';
import { Address } from '../entities/address.entity';

export async function seedInitialData(dataSource: DataSource) {
  console.log('🌱 Starting seed...');

  const userRepository = dataSource.getRepository(User);
  const personRepository = dataSource.getRepository(Person);
  const addressRepository = dataSource.getRepository(Address);

  // Создать тестовых пользователей
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Admin user
  const admin = userRepository.create({
    email: 'admin@spr.am',
    password: hashedPassword,
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
    isActive: true,
  });
  await userRepository.save(admin);

  // 2. Agency Operator
  const operator = userRepository.create({
    email: 'operator@mcs.am',
    password: hashedPassword,
    firstName: 'Agency',
    lastName: 'Operator',
    role: UserRole.AGENCY_OPERATOR,
    agencyId: 'AGENCY_MCS',
    isActive: true,
  });
  await userRepository.save(operator);

  // 3. Создать тестовых граждан

  const citizenAddress = addressRepository.create({
    country: 'Armenia',
    region: 'Yerevan',
    city: 'Yerevan',
    street: 'Abovyan',
    building: '10',
    apartment: '25',
    postalCode: '0001',
  });
  await addressRepository.save(citizenAddress);

  const person1 = personRepository.create({
    psn: '1101019001', // Мужчина, 1 января 1990
    firstName: 'Armen',
    lastName: 'Petrosyan',
    middleName: 'Gevorgovich',
    dateOfBirth: new Date('1990-01-01'),
    placeOfBirth: 'Yerevan, Armenia',
    gender: Gender.MALE,
    citizenshipStatus: CitizenshipStatus.CITIZEN,
    nationality: 'Armenian',
    email: 'armen@example.com',
    phone: '+37412345678',
    primaryAddress: citizenAddress,
    isActive: true,
  });
  await personRepository.save(person1);

  // Создать citizen user для person1
  const citizen1 = userRepository.create({
    email: 'armen@example.com',
    password: hashedPassword,
    firstName: 'Armen',
    lastName: 'Petrosyan',
    role: UserRole.CITIZEN,
    psn: person1.psn,
    isActive: true,
  });
  await userRepository.save(citizen1);

  // Второй гражданин
  const citizenAddress2 = addressRepository.create({
    country: 'Armenia',
    region: 'Shirak',
    city: 'Gyumri',
    street: 'Gorky',
    building: '5',
    apartment: '12',
    postalCode: '3101',
  });
  await addressRepository.save(citizenAddress2);

  const person2 = personRepository.create({
    psn: '5102019502', // Женщина, 2 января 1995
    firstName: 'Anna',
    lastName: 'Harutyunyan',
    dateOfBirth: new Date('1995-01-02'),
    placeOfBirth: 'Gyumri, Armenia',
    gender: Gender.FEMALE,
    citizenshipStatus: CitizenshipStatus.CITIZEN,
    nationality: 'Armenian',
    email: 'anna@example.com',
    phone: '+37412345679',
    primaryAddress: citizenAddress2,
    isActive: true,
  });
  await personRepository.save(person2);

  const citizen2 = userRepository.create({
    email: 'anna@example.com',
    password: hashedPassword,
    firstName: 'Anna',
    lastName: 'Harutyunyan',
    role: UserRole.CITIZEN,
    psn: person2.psn,
    isActive: true,
  });
  await userRepository.save(citizen2);

  // Завершение
  console.log('✅ Seed completed!');

  console.log('\n📋 Test credentials:');
  console.log('Admin: admin@spr.am / password123');
  console.log('Operator: operator@mcs.am / password123');
  console.log('Citizen 1: armen@example.com / password123 (PSN: 1101019001)');
  console.log('Citizen 2: anna@example.com / password123 (PSN: 5102019502)');
}
