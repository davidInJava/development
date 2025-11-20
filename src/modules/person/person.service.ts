import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from '../../database/entities/person.entity';
import { Address } from '../../database/entities/address.entity';
import { CreatePersonDto } from './dto/create-person.dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto/update-person.dto';
import { PSNGenerator } from 'src/utils/encryption.util';


@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(Person)
    private personRepository: Repository<Person>,

    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
  ) {}

  /**
   * CP01 - Register Person
   * Регистрация нового человека в системе с генерацией PSN
   */
  async create(createPersonDto: CreatePersonDto): Promise<Person> {
    const dateOfBirth = new Date(createPersonDto.dateOfBirth);
    const serialNumber = await this.getNextSerialNumber(
      dateOfBirth,
      createPersonDto.gender,
    );

    const psn = PSNGenerator.generate(
      dateOfBirth,
      createPersonDto.gender as 'MALE' | 'FEMALE',
      serialNumber,
    );

    const existingPerson = await this.personRepository.findOne({
      where: { psn },
    });
    if (existingPerson) {
      throw new ConflictException('PSN already exists');
    }

    let primaryAddress: Address | undefined;
    if (createPersonDto.primaryAddress) {
      primaryAddress = this.addressRepository.create(
        createPersonDto.primaryAddress,
      );
      await this.addressRepository.save(primaryAddress);
    }

    const person = this.personRepository.create({
      ...createPersonDto,
      psn,
      dateOfBirth,
      primaryAddress,
    });

    return this.personRepository.save(person);
  }

  /**
   * CP02 - Update Person Data
   * Обновление данных человека с сохранением истории
   */
  async update(psn: string, updatePersonDto: UpdatePersonDto): Promise<Person> {
    const person = await this.findByPSN(psn);

    if (updatePersonDto.primaryAddress) {
      if (person.primaryAddress) {
        Object.assign(person.primaryAddress, updatePersonDto.primaryAddress);
        await this.addressRepository.save(person.primaryAddress);
      } else {
        const newAddress = this.addressRepository.create(
          updatePersonDto.primaryAddress,
        );
        await this.addressRepository.save(newAddress);
        person.primaryAddress = newAddress;
      }
    }

    Object.assign(person, updatePersonDto);

    return this.personRepository.save(person);
  }

  /**
   * CP03 - Get Person by PSN
   * Получение данных о человеке по PSN
   */
  async findByPSN(psn: string): Promise<Person> {
    if (!PSNGenerator.validate(psn)) {
      throw new BadRequestException('Invalid PSN format');
    }

    const person = await this.personRepository.findOne({
      where: { psn },
      relations: ['primaryAddress', 'secondaryAddress'],
    });

    if (!person) {
      throw new NotFoundException(`Person with PSN ${psn} not found`);
    }

    return person;
  }

  /**
   * CP04 - Search Person
   * Поиск людей по различным критериям
   */
  async search(searchParams: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    email?: string;
    phone?: string;
  }): Promise<Person[]> {
    const queryBuilder = this.personRepository
      .createQueryBuilder('person')
      .leftJoinAndSelect('person.primaryAddress', 'primaryAddress');

    if (searchParams.firstName) {
      queryBuilder.andWhere('person.firstName ILIKE :firstName', {
        firstName: `%${searchParams.firstName}%`,
      });
    }

    if (searchParams.lastName) {
      queryBuilder.andWhere('person.lastName ILIKE :lastName', {
        lastName: `%${searchParams.lastName}%`,
      });
    }

    if (searchParams.dateOfBirth) {
      queryBuilder.andWhere('person.dateOfBirth = :dateOfBirth', {
        dateOfBirth: searchParams.dateOfBirth,
      });
    }

    if (searchParams.email) {
      queryBuilder.andWhere('person.email = :email', {
        email: searchParams.email,
      });
    }

    if (searchParams.phone) {
      queryBuilder.andWhere('person.phone = :phone', {
        phone: searchParams.phone,
      });
    }

    const results = await queryBuilder.take(100).getMany();

    if (results.length > 100) {
      throw new BadRequestException(
        'Too many persons found. Please refine your search criteria.',
      );
    }

    return results;
  }

  /**
   * CP05 - Get Group of Persons
   * Получение группы людей по критериям с пагинацией
   */
  async findAll(filters: {
    citizenshipStatus?: string;
    gender?: string;
    city?: string;
    skip?: number;
    take?: number;
  }): Promise<{ data: Person[]; total: number }> {
    const queryBuilder = this.personRepository
      .createQueryBuilder('person')
      .leftJoinAndSelect('person.primaryAddress', 'primaryAddress');

    if (filters.citizenshipStatus) {
      queryBuilder.andWhere('person.citizenshipStatus = :status', {
        status: filters.citizenshipStatus,
      });
    }

    if (filters.gender) {
      queryBuilder.andWhere('person.gender = :gender', {
        gender: filters.gender,
      });
    }

    if (filters.city) {
      queryBuilder.andWhere('primaryAddress.city = :city', {
        city: filters.city,
      });
    }

    const skip = filters.skip || 0;
    const take = filters.take || 10;

    queryBuilder.skip(skip).take(take);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  /**
   * CP06 - Get Statistics
   * Получение статистической информации
   */
  async getStatistics(): Promise<{
    totalPersons: number;
    byGender: { male: number; female: number; other: number };
    byCitizenshipStatus: Record<string, number>;
    byCity: Record<string, number>;
  }> {
    const totalPersons = await this.personRepository.count();

    const genderStats = await this.personRepository
      .createQueryBuilder('person')
      .select('person.gender', 'gender')
      .addSelect('COUNT(*)', 'count')
      .groupBy('person.gender')
      .getRawMany();

    const byGender = {
      male: 0,
      female: 0,
      other: 0,
    };

    genderStats.forEach((stat) => {
      if (stat.gender === 'MALE') byGender.male = parseInt(stat.count);
      if (stat.gender === 'FEMALE') byGender.female = parseInt(stat.count);
      if (stat.gender === 'OTHER') byGender.other = parseInt(stat.count);
    });

    const citizenshipStats = await this.personRepository
      .createQueryBuilder('person')
      .select('person.citizenshipStatus', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('person.citizenshipStatus')
      .getRawMany();

    const byCitizenshipStatus: Record<string, number> = {};

    citizenshipStats.forEach((stat) => {
      byCitizenshipStatus[stat.status] = parseInt(stat.count);
    });

    const cityStats = await this.personRepository
      .createQueryBuilder('person')
      .leftJoin('person.primaryAddress', 'address')
      .select('address.city', 'city')
      .addSelect('COUNT(*)', 'count')
      .where('address.city IS NOT NULL')
      .groupBy('address.city')
      .getRawMany();

    const byCity: Record<string, number> = {};

    cityStats.forEach((stat) => {
      if (stat.city) {
        byCity[stat.city] = parseInt(stat.count);
      }
    });

    return {
      totalPersons,
      byGender,
      byCitizenshipStatus,
      byCity,
    };
  }

  /**
   * Вспомогательный метод: получить следующий серийный номер для даты рождения
   */
  private async getNextSerialNumber(
    dateOfBirth: Date,
    gender: string,
  ): Promise<number> {
    const startDay =
      gender === 'MALE'
        ? 10 + dateOfBirth.getDate()
        : 50 + dateOfBirth.getDate();
    const prefix = String(startDay).padStart(2, '0');

    const persons = await this.personRepository
      .createQueryBuilder('person')
      .where('person.psn LIKE :prefix', { prefix: `${prefix}%` })
      .andWhere('person.dateOfBirth = :date', { date: dateOfBirth })
      .getMany();

    if (persons.length === 0) {
      return 1;
    }

    let maxSerial = 0;

    persons.forEach((person) => {
      const serial = parseInt(person.psn.substring(6, 9));
      if (serial > maxSerial) {
        maxSerial = serial;
      }
    });

    return maxSerial + 1;
  }
}
