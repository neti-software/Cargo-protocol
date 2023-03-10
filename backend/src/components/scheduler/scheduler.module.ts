import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { RebalancerModule } from './rebalancer/rebalancer.module';

@Module({
  imports: [RebalancerModule],
  providers: [SchedulerService],
  exports: []
})
export class SchedulerModule {}
