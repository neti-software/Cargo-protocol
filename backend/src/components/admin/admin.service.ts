import config from '@/config';
import { AuthService } from '@components/auth/auth.service';
import { AppErrorCode } from '@constant/errors.constant';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppError } from '@shares/AppError';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Admin } from './admin.entity';

@Injectable()
export class AdminService {
  private readonly SUPER_ADMIN_ADDRESS = config.superAdminAddress;
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>
  ) {}

  async create(admin: Partial<Admin>): Promise<Admin> {
    const addressExists = await this.getByAddress(admin.address);
    if (addressExists) {
      throw new AppError(
        AppErrorCode.Conflict,
        `Admin with address='${admin.address}' already exists`
      );
    }

    return await this.adminRepository.save({
      ...admin,
      address: admin.address.toLowerCase()
    });
  }

  async getAdmins(): Promise<Admin[]> {
    return await this.adminRepository.find();
  }

  async getById(id: string): Promise<Admin> {
    const admin = await this.adminRepository.findOne({ id });
    if (!admin) {
      throw new AppError(AppErrorCode.NotFound, `Admin with id='${id}' doesn't exist`);
    }
    return admin;
  }

  async getByAddress(address: string): Promise<Admin> {
    return await this.adminRepository.findOne({
      address
    });
  }

  async update(id: string, newAdmin: Partial<Admin>): Promise<UpdateResult> {
    return this.adminRepository.update(id, newAdmin);
  }

  async delete(id: string): Promise<DeleteResult> {
    const admin = await this.getById(id);
    if (AuthService.compareAddresses(admin.address, this.SUPER_ADMIN_ADDRESS)) {
      throw new AppError(AppErrorCode.Locked, 'Super admin cannot be removed');
    }
    return await this.adminRepository.delete({ id });
  }
}
