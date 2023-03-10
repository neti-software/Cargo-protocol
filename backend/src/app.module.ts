import { LoggerMiddleware } from '@/shares/middlewares/logger.middleware';
import { database } from '@database/config/config';
import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsoleModule } from 'nestjs-console';
import { ScheduleModule } from '@nestjs/schedule';
import { NetworkModule } from '@components/network/network.module';
import { PoolModule } from '@components/pool/pool.module';
import { StrategyModule } from '@components/strategy/strategy.module';
import { TokenModule } from '@components/token/token.module';
import { SchedulerModule } from '@components/scheduler/scheduler.module';
import { AdminModule } from '@components/admin/admin.module';
import { AuthModule } from '@components/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    ConsoleModule,
    TypeOrmModule.forRoot(database),
    ScheduleModule.forRoot(),
    AuthModule,
    AdminModule,
    NetworkModule,
    PoolModule,
    StrategyModule,
    TokenModule,
    SchedulerModule
  ],
  controllers: [],
  providers: [Logger]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('/');
  }
}
