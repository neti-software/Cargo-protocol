import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './admin.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '@components/auth/auth.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([Admin]), forwardRef(() => AuthModule)],
  providers: [AdminService],
  controllers: [AdminController],
  exports: [AdminService]
})
export class AdminModule {}
