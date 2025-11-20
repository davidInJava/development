import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',

  host: configService.get<string>('DATABASE_HOST'),
  port: configService.get<number>('DATABASE_PORT'),
  username: configService.get<string>('DATABASE_USERNAME'),
  password: configService.get<string>('DATABASE_PASSWORD'),
  database: configService.get<string>('DATABASE_NAME'),

  entities: [__dirname + '/../database/entities/*.entity{.ts,.js}'],

  synchronize: configService.get<string>('NODE_ENV') === 'development',

  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  migrationsRun: true,

  logging: configService.get<string>('NODE_ENV') === 'development',

  ssl:
    configService.get<string>('NODE_ENV') === 'production'
      ? { rejectUnauthorized: false }
      : false,
});
