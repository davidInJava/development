import { IsObject, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CompleteState {
  ACTIVATE = 'activate',
  BLOCKED = 'blocked',
  COMPLETE = 'complete',
}

export class CreateChangeRequestDto {
  @ApiProperty({
    description: 'JSON с полями для изменения (ключи ограничены)',
    example: { firstName: 'New', lastName: 'Name' },
  })
  @IsObject()
  @IsNotEmpty()
  edit: Record<string, any>;

  @ApiProperty({ enum: CompleteState })
  @IsEnum(CompleteState)
  complete: CompleteState;
}
