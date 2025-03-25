const express = require("express");
const router = express.Router();
const playerController = require("../controllers/playerController");

router.get("/api/users", playerController.getUserProfile);
router.post("/api/users/multiple", playerController.getUsersProfiles);
router.get("/api/users/stats", playerController.getUserStats);
router.get("/api/users/stats/501", playerController.get501Stats);
router.get("/api/users/stats/zombies", playerController.getZombiesStats);
router.get("/api/users/stats/killstreak", playerController.getKillstreakStats);
router.get("/api/users/stats/atw", playerController.getATWStats);
router.get("/api/users/friends", playerController.getUserFriends);
router.get("/api/users/requests", playerController.getUserRequests);
router.get("/api/users/cosmetics", playerController.getUserCosmetics); // on character creation default skins are applied
router.get("/api/users/preferences", playerController.getUserPreferences);

router.post("/api/unlock-achievement", playerController.unlockAchievement);
router.put("/api/users/handedness", playerController.changeHandedness);
router.put("/api/users/gender", playerController.changeGender);
router.put("/api/users/equip-cosmetic", playerController.equipCosmetics);

router.get("/api/all-cosmetics", playerController.getAllCosmetics);

module.exports = router;

// /leaderboard
// /users/leaderboard - this user's position on the leaderboard
