const cron = require('node-cron');
const LeagueService = require('./services/leagueService');  // Adjust the path as needed

function startCronJobs() {
  // Run the job every minute
  cron.schedule('* * * * *', () => {
    console.log('Running inactive player check');
    LeagueService.monitorInactivePlayers();
  });

  console.log('Cron jobs started');
}

module.exports = { startCronJobs };