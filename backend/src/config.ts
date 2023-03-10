const config = {
  superAdminAddress: process.env.SUPER_ADMIN_ADDRESS,
  rebalancer: {
    botPrivateKey: process.env.REBALANCER_BOT_PRIVATE_KEY,
    mainSchedule: process.env.REBALANCER_MAIN_SCHEDULE
  }
};

export default config;
