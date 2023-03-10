import { AdminService } from '@components/admin/admin.service';
import { Injectable } from '@nestjs/common';
import { GetNonceDto, LoginDto } from './auth.dto';
import * as EthUtil from 'ethereumjs-util';
import { convertUtf8ToHex } from '@walletconnect/utils';
import { AppError } from '@shares/AppError';
import { AppErrorCode } from '@constant/errors.constant';
import { JwtService } from '@nestjs/jwt';
import * as Crypto from 'crypto';
import * as Moment from 'moment';
import { isString } from 'lodash';
import config from '@/config';
import { Role } from '@components/auth/roles/role.enum';

@Injectable()
export class AuthService {
  private readonly NONCE_TIMEOUT_SECONDS = 60;
  private readonly TOKEN_TIMEOUT_HOURS = 8;
  private readonly SUPER_ADMIN_ADDRESS = config.superAdminAddress;

  constructor(private adminService: AdminService, private jwtService: JwtService) {}

  async verifyToken(token: string, roles: string[]): Promise<boolean> {
    if (!token) {
      return false;
    }

    const data = this.getTokenData(token);

    if (!data || !data.timestamp || !isString(data.address)) {
      return false;
    }

    const checkRole = roles.some((role) => data.role == role);
    if (!checkRole) return false;

    if (Moment().isAfter(Moment(data.timestamp).add(this.TOKEN_TIMEOUT_HOURS, 'hours'))) {
      return false;
    }
    return this.isAdmin(data.address);
  }

  async getNonce({ address }: GetNonceDto): Promise<string> {
    if (!this.isAdmin(address)) {
      throw new AppError(AppErrorCode.Forbidden, `Forbidden resource`);
    }

    const nonce = this.generateNonce();
    const admin = await this.adminService.getByAddress(address);

    if (admin) {
      await this.adminService.update(admin.id, {
        nonce,
        nonceTimestamp: new Date()
      });
    } else if (AuthService.compareAddresses(address, this.SUPER_ADMIN_ADDRESS)) {
      await this.adminService.create({
        name: 'Super admin',
        address: this.SUPER_ADMIN_ADDRESS,
        nonce,
        nonceTimestamp: new Date(),
        role: Role.ADMIN
      });
    }

    return nonce;
  }

  async login(loginDto: LoginDto): Promise<string> {
    if (!this.isAdmin(loginDto.address)) {
      throw new AppError(AppErrorCode.Forbidden, `Forbidden resource`);
    }

    const admin = await this.adminService.getByAddress(loginDto.address);
    if (!admin || admin.nonce !== loginDto.msg.nonce) {
      throw new AppError(AppErrorCode.Unauthorized, `Wrong nonce`);
    }

    const nonceDate = Moment(admin.nonceTimestamp);
    if (Moment().isAfter(nonceDate.add(this.NONCE_TIMEOUT_SECONDS, 'seconds'))) {
      throw new AppError(AppErrorCode.Forbidden, `Nonce timeout exceded`);
    }

    if (loginDto.signature != '0x') {
      const isValid = this.verifySignature(loginDto);
      if (!isValid) {
        throw new AppError(AppErrorCode.Unauthorized, `Signature verification failed`);
      }
    }

    await this.adminService.update(admin.id, {
      nonce: null,
      nonceTimestamp: null
    });

    const jwtPayload = {
      address: loginDto.address,
      timestamp: Date.now(),
      role: admin.role
    };
    return this.jwtService.sign(jwtPayload);
  }

  async isAdmin(address: string): Promise<boolean> {
    if (
      this.SUPER_ADMIN_ADDRESS &&
      AuthService.compareAddresses(address, this.SUPER_ADMIN_ADDRESS)
    ) {
      return true;
    }

    const admins = await this.adminService.getAdmins();
    return !!admins.find((admin) => AuthService.compareAddresses(admin.address, address));
  }

  async checkAdminRole(address: string): Promise<string> {
    if (
      this.SUPER_ADMIN_ADDRESS &&
      AuthService.compareAddresses(address, this.SUPER_ADMIN_ADDRESS)
    ) {
      return Role.ADMIN;
    }

    const admins = await this.adminService.getAdmins();
    const admin = admins.find((a) => {
      return a.address.toLowerCase() == address.toLowerCase();
    });
    if (admin) return admin.role;
    else return null;
  }

  public static compareAddresses(address1: string, address2: string): boolean {
    return address1.toLowerCase() === address2.toLowerCase();
  }

  private generateNonce(): string {
    return Crypto.randomBytes(64).toString('base64');
  }

  private verifySignature({ msg, address, signature }: LoginDto): boolean {
    const hashPersonalMessage = this.hashPersonalMessage(JSON.stringify(msg));
    const signer = this.recoverPublicKey(signature, hashPersonalMessage);
    return AuthService.compareAddresses(signer, address);
  }

  private hashPersonalMessage(msg: string) {
    const data = this.encodePersonalMessage(msg);
    const buf = EthUtil.toBuffer(data);
    const hash = EthUtil.keccak256(buf);
    return EthUtil.bufferToHex(hash);
  }

  private recoverPublicKey(sig: string, hash: string): string {
    const params = EthUtil.fromRpcSig(sig);
    const result = EthUtil.ecrecover(EthUtil.toBuffer(hash), params.v, params.r, params.s);

    return EthUtil.bufferToHex(EthUtil.publicToAddress(result));
  }

  private encodePersonalMessage(msg: string): string {
    const data = EthUtil.toBuffer(convertUtf8ToHex(msg));
    const buf = Buffer.concat([
      Buffer.from('\u0019Ethereum Signed Message:\n' + data.length.toString(), 'utf8'),
      data
    ]);
    return EthUtil.bufferToHex(buf);
  }

  private getTokenData(token: string): Record<string, unknown> | null {
    try {
      return this.jwtService.verify(token);
    } catch {
      return null;
    }
  }
}
