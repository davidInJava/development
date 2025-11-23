import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CitizenLoginDto {
  @ApiProperty({
    description: 'Email or PSN (10-digit identifier)',
    example: 'john@example.com',
  })
  @IsString()
  identifier: string;

  @ApiProperty({ example: 'P@ssw0rd' })
  @IsString()
  password: string;
}
