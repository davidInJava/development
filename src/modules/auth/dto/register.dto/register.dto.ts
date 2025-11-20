import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/database/entities';
export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;
  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;
  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;
  @ApiProperty({ enum: UserRole, default: UserRole.CITIZEN })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  psn?: string;
}
