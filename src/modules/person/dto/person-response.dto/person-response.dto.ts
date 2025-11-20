import { ApiProperty } from '@nestjs/swagger';
export class PersonResponseDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  psn: string;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  middleName?: string;
  @ApiProperty()
  dateOfBirth: Date;
  @ApiProperty()
  gender: string;
  @ApiProperty()
  citizenshipStatus: string;
  @ApiProperty()
  email?: string;
  @ApiProperty()
  phone?: string;
  @ApiProperty()
  primaryAddress?: any;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
}
