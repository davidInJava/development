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
    // payload.sub for citizen JWT should contain PSN
    // Log payload for debugging (remove in production)
    // eslint-disable-next-line no-console
    console.log('jwt-person payload:', payload);
    let person: any;
    if (payload.psn) {
      person = await this.personRepository.findOne({ where: { psn: payload.psn } });
    } else if (payload.sub) {
      // fallback: some tokens may have sub = id
      person = await this.personRepository.findOne({ where: { id: payload.sub } });
    }

    if (!person || !person.isActive) {
      throw new UnauthorizedException('Person not found or inactive');
    }

    return person;
  }
}
