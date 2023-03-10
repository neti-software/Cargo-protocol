import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Network } from './network.entity';
import { NetworkController } from './network.controller';
import { NetworkService } from './network.service';
import { AuthModule } from '@components/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Network]), AuthModule],
  providers: [NetworkService],
  controllers: [NetworkController],
  exports: [NetworkService]
})
export class NetworkModule {}
