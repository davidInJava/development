import { IsObject, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChangeRequestDto {
  @ApiProperty({
    description: 'JSON с полями для изменения (ключи ограничены)',
    example: { firstName: 'New', lastName: 'Name' },
  })
  @IsObject()
  @IsNotEmpty()
  edit: Record<string, any>;
}
