import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags, ApiQuery } from '@nestjs/swagger';
import { UpdateResult, DeleteResult } from 'typeorm';
import { Token } from './token.entity';
import { TokenService } from './token.service';
import { RolesGuard } from '@shares/guards/roles.guard';
import { Role } from '@components/auth/roles/role.enum';
import { Roles } from '@components/auth/roles/roles.decorator';

@Controller('token')
@ApiTags('Token')
@ApiBearerAuth()
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get()
  @ApiQuery({
    name: 'networkId',
    type: String,
    required: false
  })
  async getTokens(@Query('networkId') networkId?: string): Promise<Token[]> {
    return await this.tokenService.getTokens({ networkId });
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<Token> {
    return await this.tokenService.getById(id);
  }

  @Post()
  @ApiBody({
    type: Token
  })
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async create(@Body() token: Token): Promise<Token> {
    return await this.tokenService.create(token);
  }

  @Put(':id')
  @ApiBody({
    type: Token
  })
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async update(@Param('id') id: string, @Body() newToken: Token): Promise<UpdateResult> {
    return await this.tokenService.update(id, newToken);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async delete(@Param('id') id: string): Promise<DeleteResult> {
    return await this.tokenService.delete(id);
  }
}
