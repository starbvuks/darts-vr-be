const cron = require("node-cron");
const LeagueService = require("./services/leagueService"); // Adjust the path as needed

function startCronJobs() {
  cron.schedule("*/2 * * * *", async () => {
    await LeagueService.monitorInactivePlayers();
  });
}

// remove player from all queues on socket dsiconnet
// player status on socket con and disccon
// delete tournament endpoint

module.exports = { startCronJobs };
