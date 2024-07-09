const express = require("express");
const router = express.Router();
const friendsController = require("../controllers/friendsController");

router.post("/send-request", friendsController.sendFriendRequest);
router.post("/accept-request", friendsController.acceptFriendRequest);
router.post("/decline-request", friendsController.declineFriendRequest);
router.post("/remove-friend", friendsController.removeFriend);
router.post("/block-player", friendsController.blockPlayer);
router.post("/unblock-player", friendsController.unblockPlayer);
router.post("/unsend-request", friendsController.unsendFriendRequest);
// router.get("/search-users", friendsController.searchUsers);

module.exports = router;