import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Strategy } from './strategy.entity';
import { StrategyController } from './strategy.controller';
import { StrategyService } from './strategy.service';
import { AuthModule } from '@components/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Strategy]), AuthModule],
  providers: [StrategyService],
  controllers: [StrategyController],
  exports: [StrategyService]
})
export class StrategyModule {}
