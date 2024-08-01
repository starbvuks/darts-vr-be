const cron = require('node-cron');
const LeagueService = require('./services/leagueService');  // Adjust the path as needed

function startCronJobs() {
  cron.schedule("*/2 * * * *", async () => {
    await LeagueService.monitorInactivePlayers();
  });
}

module.exports = { startCronJobs };