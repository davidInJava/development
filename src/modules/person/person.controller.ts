import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PersonService } from './person.service';


import { UserRole } from '../../database/entities/user.entity';
import { PersonResponseDto } from './dto/person-response.dto/person-response.dto';
import { UpdatePersonDto } from './dto/update-person.dto/update-person.dto';
import { CreatePersonDto } from './dto/create-person.dto/create-person.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('Person')
@Controller('persons')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  /**
   * CP01 - Register Person
   */
  @Post()
  @Roles(UserRole.AGENCY_OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'CP01 - Register a new person' })
  @ApiResponse({
    status: 201,
    description: 'Person successfully registered',
    type: PersonResponseDto,
  })
  async create(@Body() createPersonDto: CreatePersonDto) {
    
    return this.personService.create(createPersonDto);
  }

  /**
   * CP02 - Update Person Data
   */
  @Put(':psn')
  @Roles(UserRole.AGENCY_OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'CP02 - Update person data' })
  @ApiResponse({
    status: 200,
    description: 'Person successfully updated',
    type: PersonResponseDto,
  })
  async update(
    @Param('psn') psn: string,
    @Body() updatePersonDto: UpdatePersonDto,
  ) {
    return this.personService.update(psn, updatePersonDto);
  }

  /**
   * CP03 - Get Person by PSN
   */
  @Get(':psn')
  @ApiOperation({ summary: 'CP03 - Get person by PSN' })
  @ApiResponse({ status: 200, description: 'Person found', type: PersonResponseDto })
  @ApiResponse({ status: 404, description: 'Person not found' })
  async findByPSN(@Param('psn') psn: string) {
    return this.personService.findByPSN(psn);
  }

  /**
   * CP04 - Search Person
   */
  @Get()
  @ApiOperation({ summary: 'CP04 - Search persons' })
  @ApiQuery({ name: 'firstName', required: false })
  @ApiQuery({ name: 'lastName', required: false })
  @ApiQuery({ name: 'dateOfBirth', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'phone', required: false })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: [PersonResponseDto],
  })
  async search(@Query() query: any) {
    return this.personService.search(query);
  }

  /**
   * CP05 - Get Group of Persons
   */
  @Get('list/all')
  @Roles(UserRole.AGENCY_OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'CP05 - Get group of persons with filters' })
  @ApiQuery({ name: 'citizenshipStatus', required: false })
  @ApiQuery({ name: 'gender', required: false })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of persons' })
  async findAll(@Query() filters: any) {
    return this.personService.findAll(filters);
  }

  /**
   * CP06 - Get Statistics
   */
  @Get('statistics/summary')
  @Roles(UserRole.AGENCY_OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'CP06 - Get statistical information' })
  @ApiResponse({ status: 200, description: 'Statistics' })
  async getStatistics() {
    return this.personService.getStatistics();
  }
}
