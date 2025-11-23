import { Controller, Post, Body } from '@nestjs/common';
import { Get, Req, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ChangeRequest, RequestStatus } from '../../database/entities/change-request.entity';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '../../database/entities/user.entity';
import { AuthResponseDto } from './dto/auth-response.dto/auth-response.dto';
import { RegisterDto } from './dto/register.dto/register.dto';
import { LoginDto } from './dto/login.dto/login.dto';
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(ChangeRequest)
    private changeRequestRepository: Repository<ChangeRequest>,
  ) {}
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(
    @Body() registerDto: RegisterDto,
    @Body('secretKey') secretKey: string,
  ): Promise<AuthResponseDto> {
    return this.authService.register(registerDto, secretKey);
  }
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get('requests')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENCY_OPERATOR)
  async getRequests(@Req() req: any) {
    const requests = await this.changeRequestRepository.find({
      where: { status: RequestStatus.PENDING },
      order: { createdAt: 'ASC' },
    });
    return requests;
  }
}
