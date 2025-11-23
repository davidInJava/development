import {
	Controller,
	Post,
	Body,
	BadRequestException,
	UseGuards,
	Get,
	Req,
} from '@nestjs/common';
import { CitizenService } from './citizen.service';
import { CitizenLoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { CreateChangeRequestDto } from './dto/change-request.dto';

@Controller('citizen')
export class CitizenController {
	constructor(private citizenService: CitizenService) {}

	@Post('login')
	async login(@Body() dto: CitizenLoginDto) {
		if (!dto || !dto.identifier || !dto.password) {
			throw new BadRequestException('identifier and password required');
		}
		return this.citizenService.login(dto.identifier, dto.password);
	}

	@UseGuards(AuthGuard('jwt-person'))
	@Get('me')
	async me(@Req() req: any) {
		return req.user;
	}

	@UseGuards(AuthGuard('jwt-person'))
	@Post('change-request')
	async createChangeRequest(@Req() req: any, @Body() dto: CreateChangeRequestDto) {
        
		const person: any = req.user;
		if (!person || !person.psn) {
			throw new BadRequestException('Invalid authenticated person');
		}

		// pass only JWT-authenticated person object and edit; service will extract PSN
		return this.citizenService.createChangeRequest(person, dto.edit);
	}
}
