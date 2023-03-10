import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './token.entity';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { AuthModule } from '@components/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Token]), AuthModule],
  providers: [TokenService],
  controllers: [TokenController],
  exports: []
})
export class TokenModule {}
