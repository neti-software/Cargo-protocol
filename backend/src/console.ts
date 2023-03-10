import * as dotenv from 'dotenv';
dotenv.config();

import { BootstrapConsole } from 'nestjs-console';
import { SchedulerRegistry } from '@nestjs/schedule';
import { AppModule } from '@/app.module';

const bootstrap = new BootstrapConsole({
  module: AppModule,
  useDecorators: true,
  contextOptions: {
    logger: true
  }
});
bootstrap.init().then(async (app) => {
  try {
    await app.init();
    if (!process.env.CRON_ENABLE) {
      // disable when cron enable is false
      const schedulerRegistry = app.get(SchedulerRegistry);
      const jobs = schedulerRegistry.getCronJobs();
      jobs.forEach((_, jobId) => {
        schedulerRegistry.deleteCronJob(jobId);
      });
    }
    await bootstrap.boot();
    await app.close();
    process.exit(0);
  } catch (e) {
    console.error(e);
    await app.close();
    process.exit(1);
  }
});
