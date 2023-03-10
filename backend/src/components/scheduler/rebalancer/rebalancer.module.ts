import { NetworkModule } from '@components/network/network.module';
import { StrategyModule } from '@components/strategy/strategy.module';
import { Module } from '@nestjs/common';
import { RebalancerService } from './rebalancer.service';
import { AdjustRangeService } from './services/adjust-range.service';
import { CalculateFeesService } from './services/calculate-fees.service';
import { ReinvestFeesService } from './services/reinvest-fees.service';

@Module({
  imports: [StrategyModule, NetworkModule],
  providers: [RebalancerService, AdjustRangeService, ReinvestFeesService, CalculateFeesService],
  exports: [RebalancerService]
})
export class RebalancerModule {}
