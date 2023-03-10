import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pool } from './pool.entity';
import { PoolController } from './pool.controller';
import { PoolService } from './pool.service';
import { AuthModule } from '@components/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Pool]), AuthModule],
  providers: [PoolService],
  controllers: [PoolController],
  exports: []
})
export class PoolModule {}
