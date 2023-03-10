import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { DeleteResult, UpdateResult } from 'typeorm';
import { Network } from './network.entity';
import { NetworkService } from './network.service';
import { RolesGuard } from '@shares/guards/roles.guard';
import { Role } from '@components/auth/roles/role.enum';
import { Roles } from '@components/auth/roles/roles.decorator';

@Controller('network')
@ApiTags('Network')
@ApiBearerAuth()
export class NetworkController {
  constructor(private readonly networkService: NetworkService) {}

  @Get('active')
  async getActiveNetwork(): Promise<Network> {
    return await this.networkService.getActive();
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<Network> {
    return await this.networkService.getById(id);
  }

  @Get()
  async getNetworks(): Promise<Network[]> {
    return await this.networkService.getNetworks();
  }

  @Post()
  @ApiBody({
    type: Network
  })
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async create(@Body() newNetwork: Network): Promise<Network> {
    return this.networkService.create(newNetwork);
  }

  @Put(':id')
  @ApiBody({
    type: Network
  })
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async update(@Param('id') id: string, @Body() newNetwork: Network): Promise<UpdateResult> {
    return await this.networkService.update(id, newNetwork);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async delete(@Param('id') id: string): Promise<DeleteResult> {
    return await this.networkService.delete(id);
  }
}
