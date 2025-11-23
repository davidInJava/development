import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { PersonModule } from './modules/person/person.module';
import { CitizenController } from './modules/citizen/citizen.controller';
import { CitizenService } from './modules/citizen/citizen.service';
import { CitizenModule } from './modules/citizen/citizen.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    AuthModule,
    PersonModule,
    CitizenModule,
  ],
  controllers: [AppController, CitizenController],
  providers: [AppService, CitizenService],
})
export class AppModule {}
