import { IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApproveChangeRequestDto {
  @ApiProperty({
    description: 'PSN человека',
    example: '1234567890123',
  })
  @IsString()
  psn: string;

  @ApiProperty({
    description: 'Одобрить запрос (true) или отклонить (false)',
    example: true,
  })
  @IsBoolean()
  is_approve: boolean;
}