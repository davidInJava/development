import {
	Injectable,
	UnauthorizedException,
	BadRequestException,
	ConflictException,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from '../../database/entities/person.entity';
import { ChangeRequest, RequestStatus, RequestType } from '../../database/entities/change-request.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CitizenService {
	constructor(
		@InjectRepository(Person)
		private personRepository: Repository<Person>,
		@InjectRepository(ChangeRequest)
		private changeRequestRepository: Repository<ChangeRequest>,
		private jwtService: JwtService,
		private configService: ConfigService,
	) {}

	/**
	 * Login by email or psn (identifier) + password
	 */
	async login(identifier: string | number, password: string | number) {
		if (identifier === undefined || identifier === null || password === undefined || password === null) {
			throw new BadRequestException('Identifier and password are required');
		}

		const identifierStr = String(identifier).trim();
		const passwordStr = String(password);

		if (!identifierStr || !passwordStr) {
			throw new BadRequestException('Identifier and password are required');
		}

		const person = await this.personRepository
			.createQueryBuilder('person')
			.addSelect('person.password')
			.where('person.email = :id OR person.psn = :id', { id: identifierStr })
			.getOne();

		if (!person) {
			throw new UnauthorizedException('Invalid credentials');
		}

		if (!person.password || typeof person.password !== 'string') {
			// If password stored incorrectly or missing, deny login
			throw new UnauthorizedException('Invalid credentials');
		}

		const isValid = await bcrypt.compare(passwordStr, person.password);
		if (!isValid) {
			throw new UnauthorizedException('Invalid credentials');
		}

		if (!person.isActive) {
			throw new UnauthorizedException('Account is inactive');
		}

		const payload = {
			sub: person.id,
			psn: person.psn,
			email: person.email,
			type: 'citizen',
		};

		const accessToken = this.jwtService.sign(payload, {
			secret: this.configService.get('JWT_SECRET'),
			expiresIn: this.configService.get('JWT_EXPIRATION'),
		});

		const refreshToken = this.jwtService.sign(payload, {
			secret: this.configService.get('JWT_REFRESH_SECRET'),
			expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
		});

		// don't return password
		const { password: _p, ...rest } = person as any;

		return {
			accessToken,
			refreshToken,
			user: rest,
		};
	}

	async validateById(personId: string): Promise<Person> {
		const person = await this.personRepository.findOne({ where: { id: personId } });
		if (!person || !person.isActive) {
			throw new UnauthorizedException('Person not found or inactive');
		}
		return person;
	}

	/**
	 * Create a change request for the authenticated person
	 */
	async createChangeRequest(personId: string, edit: Record<string, any>, complete: string) {
		// validate person existence
		const person = await this.personRepository.findOne({ where: { id: personId } });
		if (!person) {
			throw new NotFoundException('Person not found');
		}

		// check existing active (pending) request for this person
		const existing = await this.changeRequestRepository.findOne({
			where: { personId: person.id, status: RequestStatus.PENDING },
		});
		if (existing) {
			throw new ConflictException('There is already an active change request for this person');
		}

		// allowed keys
		const allowedKeys = new Set([
			'firstName',
			'lastName',
			'middleName',
			'dateOfBirth',
			'placeOfBirth',
			'gender',
			'citizenshipStatus',
			'nationality',
			'photo',
			'email',
			'phone',
		]);

		const invalidKeys = Object.keys(edit || {}).filter((k) => !allowedKeys.has(k));
		if (invalidKeys.length > 0) {
			throw new BadRequestException(`Invalid edit keys: ${invalidKeys.join(', ')}`);
		}

		// prepare currentData (only include requested keys)
		const currentData: Record<string, any> = {};
		Object.keys(edit || {}).forEach((k) => {
			currentData[k] = (person as any)[k];
		});

		// build request
		const request = this.changeRequestRepository.create({
			requestNumber: `CR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
			person,
			personId: person.id,
			submittedBy: person.id,
			requestType: RequestType.UPDATE_PERSONAL_INFO,
			status: RequestStatus.PENDING,
			requestedChanges: edit,
			currentData,
		});

		const saved = await this.changeRequestRepository.save(request);
		return saved;
	}
}
