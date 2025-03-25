const PlayerService = require("../services/playerService");
const authService = require("../services/auth/authService");
const Cosmetics = require("../models/Cosmetics");
const mongoose = require("mongoose");

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

exports.getUsersProfiles = (req, res) => {
  authService.validateJwt(req, res, async () => {
    const userIds = req.body.userIds;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).send({ message: "Invalid or missing userIds" });
    }

    const results = [];
    const validIds = [];
    const invalidIds = [];

    // Validate IDs and separate them into valid and invalid lists
    userIds.forEach((id) => {
      if (mongoose.Types.ObjectId.isValid(id)) {
        validIds.push(id);
      } else {
        invalidIds.push(id);
        results.push({ id, error: `The ID ${id} is not valid` });
      }
    });

    try {
      // Fetch valid user profiles
      if (validIds.length > 0) {
        const users = await PlayerService.getUsersProfiles(validIds);
        // Add valid users to results
        users.forEach((user) => {
          results.push(user);
        });

        // Handle valid IDs not found in the database
        const foundIds = users.map((user) => user._id.toString());
        const notFoundIds = validIds.filter((id) => !foundIds.includes(id));
        notFoundIds.forEach((id) => {
          results.push({ id, error: `No user found with ID ${id}` });
        });
      }

      res.send(results);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).send({ message: "Server error" });
    }
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

exports.equipCosmetics = (req, res) => {
  authService.validateJwt(req, res, async () => {
    const { cosmeticIds } = req.body;
    const userId = req.userId;
    try {
      const player = await PlayerService.equipCosmetics(userId, cosmeticIds);
      res.json(player);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
};

exports.getAllCosmetics = (req, res) => {
  try {
    const cosmetics = PlayerService.getAllCosmetics();
    return res.status(200).json({ success: true, cosmetics });
  } catch (error) {
    console.error("Error fetching cosmetics:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cosmetics.",
    });
  }
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

exports.get501Stats = (req, res) => {
  authService.validateJwt(req, res, async () => {
    const userId = req.userId;
    try {
      const stats = await PlayerService.get501Stats(userId);
      res.status(200).json(stats);
    } catch (error) {
      console.error("Error fetching 501 stats:", error);
      res.status(500).json({ message: "Error fetching 501 stats" });
    }
  });
};

exports.getZombiesStats = (req, res) => {
  authService.validateJwt(req, res, async () => {
    const userId = req.userId;
    try {
      const stats = await PlayerService.getZombiesStats(userId);
      res.status(200).json(stats);
    } catch (error) {
      console.error("Error fetching zombies stats:", error);
      res.status(500).json({ message: "Error fetching zombies stats" });
    }
  });
};

exports.getKillstreakStats = (req, res) => {
  authService.validateJwt(req, res, async () => {
    const userId = req.userId;
    try {
      const stats = await PlayerService.getKillstreakStats(userId);
      res.status(200).json(stats);
    } catch (error) {
      console.error("Error fetching killstreak stats:", error);
      res.status(500).json({ message: "Error fetching killstreak stats" });
    }
  });
};

exports.getATWStats = (req, res) => {
  authService.validateJwt(req, res, async () => {
    const userId = req.userId;
    try {
      const stats = await PlayerService.getATWStats(userId);
      res.status(200).json(stats);
    } catch (error) {
      console.error("Error fetching ATW stats:", error);
      res.status(500).json({ message: "Error fetching ATW stats" });
    }
  });
};
