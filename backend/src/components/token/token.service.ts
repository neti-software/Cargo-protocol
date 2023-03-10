import { AppErrorCode } from '@constant/errors.constant';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppError } from '@shares/AppError';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { omitBy, isUndefined } from 'lodash';
import { Token } from './token.entity';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>
  ) {}

  async create(token: Token): Promise<Token> {
    const addressExists = await this.getByAddress(token);
    if (addressExists) {
      throw new AppError(
        AppErrorCode.Conflict,
        `Token with address='${token.address}' already exists in this network`
      );
    }

    return await this.tokenRepository.save({ ...token });
  }

  async getTokens(filterObj: Partial<Pick<Token, 'networkId'>>): Promise<Token[]> {
    return await this.tokenRepository.find({
      ...omitBy(filterObj, isUndefined)
    });
  }

  async getById(id: string): Promise<Token> {
    const token = await this.tokenRepository.findOne({ id });
    if (!token) {
      throw new AppError(AppErrorCode.NotFound, `Token with id='${id}' doesn't exist`);
    }
    return token;
  }

  async getByAddress(token: Token): Promise<Token> {
    return await this.tokenRepository.findOne({
      networkId: token.networkId,
      address: token.address
    });
  }

  async update(id: string, newToken: Token): Promise<UpdateResult> {
    const addressExists = await this.getByAddress(newToken);
    const oldToken = await this.getById(id);

    if (addressExists && newToken.address !== oldToken.address) {
      throw new AppError(
        AppErrorCode.Conflict,
        `Token with address='${newToken.address}' already exists in this network`
      );
    }

    return this.tokenRepository.update(id, newToken);
  }

  async delete(id: string): Promise<DeleteResult> {
    return await this.tokenRepository.delete({ id });
  }
}
