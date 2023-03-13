import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Initiative } from 'entities/initiative.entity';
import { Risk } from 'entities/risk.entity';
import { User } from 'entities/user.entitiy';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InitiativeModule } from './initiative/initiative.module';
import { RiskModule } from './risk/risk.module';
import { SharedModule } from './shared/shared.module';


@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'root',
    database: 'risk',
    synchronize: true,
    entities:[`dist/**/*.entity{.ts,.js}`],
    autoLoadEntities: true,
    namingStrategy:new SnakeNamingStrategy(),
  }),
  RiskModule,
  InitiativeModule,
  ScheduleModule.forRoot()
]
  ,
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
