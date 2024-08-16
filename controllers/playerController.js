const PlayerService = require("../services/playerService");
const authService = require("../services/auth/authService");
const jwt = require("jsonwebtoken");

exports.getUserProfile = (req, res) => {
  authService.validateJwt(req, res, async () => {
    const userId = req.userId;
    console.log(userId);
    const user = await PlayerService.getUserProfile(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send(user);
  });
};

exports.getUserStats = async (req, res) => {
  authService.validateJwt(req, res, async () => {
    const userId = req.userId;
    const user = await PlayerService.getUserStats(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send(user);
  });
};

exports.getUserFriends = async (req, res) => {
  authService.validateJwt(req, res, async () => {
    const userId = req.userId;
    const user = await PlayerService.getUserFriends(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send(user);
  });
};

exports.getUserRequests = async (req, res) => {
  authService.validateJwt(req, res, async () => {
    const userId = req.userId;
    const user = await PlayerService.getUserRequests(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send(user);
  });
};

exports.getUserCosmetics = async (req, res) => {
  authService.validateJwt(req, res, async () => {
    const userId = req.userId;
    const user = await PlayerService.getUserCosmetics(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send(user);
  });
};

exports.getUserPreferences = async (req, res) => {
  authService.validateJwt(req, res, async () => {
    const userId = req.userId;
    const user = await PlayerService.getUserPreferences(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send(user);
  });
};

exports.changeHandedness = (req, res) => {
  authService.validateJwt(req, res, async () => {
    const { handedness } = req.body;
    const userId = req.userId;
    try {
      const player = await PlayerService.changeHandedness(userId, handedness);
      res.json(player);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
};

exports.changeGender = (req, res) => {
  authService.validateJwt(req, res, async () => {
    const { gender } = req.body;
    const userId = req.userId;
    try {
      const player = await PlayerService.changeGender(userId, gender);
      res.json(player);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
};

exports.equipCosmetic = (req, res) => {
  authService.validateJwt(req, res, async () => {
    const { cosmeticId } = req.body;
    const userId = req.userId;
    try {
      const player = await PlayerService.equipCosmetic(userId, cosmeticId);
      res.json(player);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
};

exports.unlockAchievement = (req, res) => {
  authService.validateJwt(req, res, async () => {
    const userId = req.userId;
    const { achievement } = req.body;

    try {
      const result = await PlayerService.unlockAchievement(userId, achievement);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
};
