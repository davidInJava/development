import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CitizenController } from './citizen.controller';
import { CitizenService } from './citizen.service';
import { Person } from '../../database/entities/person.entity';
import { ChangeRequest } from '../../database/entities/change-request.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Person, ChangeRequest]),
		AuthModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get('JWT_SECRET'),
				signOptions: { expiresIn: configService.get('JWT_EXPIRATION') },
			}),
			inject: [ConfigService],
		}),
	],
	controllers: [CitizenController],
	providers: [CitizenService],
})
export class CitizenModule {}
