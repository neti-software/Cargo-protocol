import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import config from '@/config';
import { RebalancerService } from './rebalancer/rebalancer.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly rebalancerService: RebalancerService) {}

  @Cron(config.rebalancer.mainSchedule)
  async rebalancerMainSchedule(): Promise<void> {
    this.logger.log('Rebalancer started');
    await this.rebalancerService.rebalance();
    this.logger.log('Rebalancer completed');
  }
}
