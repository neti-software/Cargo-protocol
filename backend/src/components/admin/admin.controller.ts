import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { UpdateResult, DeleteResult } from 'typeorm';
import { Admin } from './admin.entity';
import { AdminService } from './admin.service';
import { RolesGuard } from '@shares/guards/roles.guard';
import { Role } from '@components/auth/roles/role.enum';
import { Roles } from '@components/auth/roles/roles.decorator';

@Controller('admin')
@ApiTags('Admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @ApiBody({
    type: Admin
  })
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async create(@Body() admin: Admin): Promise<Admin> {
    delete admin.nonce;
    delete admin.nonceTimestamp;
    return await this.adminService.create(admin);
  }

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getAdmins(): Promise<Omit<Admin, 'nonce' | 'nonceTimestamp'>[]> {
    const admins = await this.adminService.getAdmins();
    return admins.map((admin) => {
      delete admin.nonce;
      delete admin.nonceTimestamp;
      return admin;
    });
  }

  @Put(':id')
  @ApiBody({
    type: Admin
  })
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async update(@Param('id') id: string, @Body() newAdmin: Admin): Promise<UpdateResult> {
    delete newAdmin.nonce;
    delete newAdmin.address;
    delete newAdmin.nonceTimestamp;
    return await this.adminService.update(id, newAdmin);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async delete(@Param('id') id: string): Promise<DeleteResult> {
    return await this.adminService.delete(id);
  }

  @Get('check-celo-permission')
  @Roles(Role.CELO, Role.ADMIN)
  @UseGuards(RolesGuard)
  async checkPermission(): Promise<boolean> {
    return true;
  }
}
