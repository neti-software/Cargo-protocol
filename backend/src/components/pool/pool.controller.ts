import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags, ApiQuery } from '@nestjs/swagger';
import { UpdateResult, DeleteResult } from 'typeorm';
import { Pool } from './pool.entity';
import { PoolService } from './pool.service';
import { RolesGuard } from '@shares/guards/roles.guard';
import { Role } from '@components/auth/roles/role.enum';
import { Roles } from '@components/auth/roles/roles.decorator';

@Controller('pool')
@ApiTags('Pool')
@ApiBearerAuth()
export class PoolController {
  constructor(private readonly poolService: PoolService) {}
  @Get()
  @ApiQuery({
    name: 'networkId',
    type: String,
    required: false
  })
  async getPools(@Query('networkId') networkId?: string): Promise<Pool[]> {
    return await this.poolService.getPools({ networkId });
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<Pool> {
    return await this.poolService.getById(id);
  }

  @Post()
  @ApiBody({
    type: Pool
  })
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async create(@Body() pool: Pool): Promise<Pool> {
    return await this.poolService.create(pool);
  }

  @Put(':id')
  @ApiBody({
    type: Pool
  })
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async update(@Param('id') id: string, @Body() newPool: Pool): Promise<UpdateResult> {
    delete newPool.order;
    return this.poolService.update(id, newPool);
  }

  @Put(':id/order')
  @ApiBody({
    type: Pool
  })
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async updateOrder(
    @Param('id') id: string,
    @Body() _pool: Pick<Pool, 'order'>
  ): Promise<UpdateResult> {
    return this.poolService.updateOrder(id, _pool.order);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async delete(@Param('id') id: string): Promise<DeleteResult> {
    return await this.poolService.delete(id);
  }
}
