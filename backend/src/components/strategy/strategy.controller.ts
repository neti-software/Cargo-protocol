import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UpdateResult, DeleteResult } from 'typeorm';
import { Strategy } from './strategy.entity';
import { StrategyService } from './strategy.service';
import { RolesGuard } from '@shares/guards/roles.guard';
import { Role } from '@components/auth/roles/role.enum';
import { Roles } from '@components/auth/roles/roles.decorator';

@Controller('strategy')
@ApiTags('Strategy')
@ApiBearerAuth()
export class StrategyController {
  constructor(private readonly strategyService: StrategyService) {}

  @Get()
  @ApiQuery({
    name: 'poolId',
    type: String,
    required: false
  })
  @ApiQuery({
    name: 'networkId',
    type: String,
    required: false
  })
  async getStrategies(
    @Query('poolId') poolId?: string,
    @Query('networkId') networkId?: string
  ): Promise<Strategy[]> {
    return await this.strategyService.getStrategies({ poolId, networkId });
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<Strategy> {
    return await this.strategyService.getById(id);
  }

  @Post()
  @ApiBody({
    type: Strategy
  })
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async create(@Body() strategy: Strategy): Promise<Strategy> {
    return await this.strategyService.create(strategy);
  }

  @Put(':id')
  @ApiBody({
    type: Strategy
  })
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async update(@Param('id') id: string, @Body() newStrategy: Strategy): Promise<UpdateResult> {
    return this.strategyService.update(id, newStrategy);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async delete(@Param('id') id: string): Promise<DeleteResult> {
    return await this.strategyService.delete(id);
  }
}
