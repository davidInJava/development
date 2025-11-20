import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../database/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto/auth-response.dto';
import { LoginDto } from './dto/login.dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });
    await this.userRepository.save(user);

    return this.generateTokens(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    return this.generateTokens(user);
  }

  private async generateTokens(user: User): Promise<AuthResponseDto> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET')!,
      expiresIn: this.configService.get('JWT_EXPIRATION'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET')!,
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        psn: user.psn,
      },
    };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
