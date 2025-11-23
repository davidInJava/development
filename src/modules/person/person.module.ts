import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonService } from './person.service';
import { PersonController } from './person.controller';
import { Person } from '../../database/entities/person.entity';
import { Address } from '../../database/entities/address.entity';
import { ChangeRequest } from '../../database/entities/change-request.entity';
@Module({
imports: [TypeOrmModule.forFeature([Person, Address, ChangeRequest])],
controllers: [PersonController],
providers: [PersonService],
exports: [PersonService],
})
export class PersonModule {}