import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
  IsPhoneNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CitizenshipStatus, Gender } from 'src/database/entities';

export class CreatePersonDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'Smith', required: false })
  @IsString()
  @IsOptional()
  middleName?: string;

  @ApiProperty({ example: '1990-01-15' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ example: 'Yerevan, Armenia', required: false })
  @IsString()
  @IsOptional()
  placeOfBirth?: string;

  @ApiProperty({ enum: [Gender.MALE, Gender.FEMALE] })
  @IsEnum(Gender)
  gender: Gender.MALE | Gender.FEMALE;

  @ApiProperty({ enum: CitizenshipStatus, example: CitizenshipStatus.CITIZEN })
  @IsEnum(CitizenshipStatus)
  @IsOptional()
  citizenshipStatus?: CitizenshipStatus;

  @ApiProperty({ example: 'Armenian', required: false })
  @IsString()
  @IsOptional()
  nationality?: string;

  @ApiProperty({ example: 'john@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '+37412345678', required: false })
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  primaryAddress?: {
    country?: string;
    region?: string;
    city?: string;
    street?: string;
    building?: string;
    apartment?: string;
    postalCode?: string;
  };
}
