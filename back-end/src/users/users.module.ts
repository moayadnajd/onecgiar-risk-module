import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'entities/user.entitiy';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  imports:[TypeOrmModule.forFeature([User])],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
