import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtPersonStrategy } from './strategies/jwt-person.strategy';
import { User } from '../../database/entities/user.entity';
import { Person } from '../../database/entities/person.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Person]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtPersonStrategy],
  exports: [AuthService, JwtStrategy, JwtPersonStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
