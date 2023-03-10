import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminModule } from '../admin/admin.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';

@Module({
  imports: [AdminModule, JwtModule.register({ secret: process.env.JWT_APP_SECRET })],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule {}
