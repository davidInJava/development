import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from '../../../database/entities/person.entity';

@Injectable()
export class JwtPersonStrategy extends PassportStrategy(Strategy, 'jwt-person') {
  constructor(
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: any) {
    const person = await this.personRepository.findOne({ where: { id: payload.sub } });
    if (!person || !person.isActive) {
      throw new UnauthorizedException('Person not found or inactive');
    }
    return person;
  }
}
