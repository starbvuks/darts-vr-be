const PlayerService = require("../services/playerService");
const jwt = require("jsonwebtoken");

const validateJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.sendStatus(401); // Unauthorized
  }

  const token = authHeader.split(" ")[1];
  // console.log("Token:", token); 
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, payload) => {
    if (err) {
      console.error("JWT Verification Error:", err); 
      return res.sendStatus(403); 
    }
    // console.log("Payload:", payload);
    req.userId = payload.userID; 
    next();
  });
};

exports.getUserProfile = (req, res) => {
  validateJwt(req, res, async () => {
    const userId = req.userId;
    const user = await PlayerService.getUserProfile(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send(user);
  });
};

exports.getUserStats = async (req, res) => {
  validateJwt(req, res, async () => {
    const userId = req.userId;
    const user = await PlayerService.getUserStats(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send(user);
  });
};

exports.getUserFriends = async (req, res) => {
  validateJwt(req, res, async () => {
    const userId = req.userId;
    const user = await PlayerService.getUserFriends(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send(user);
  });
};

exports.getUserRequests = async (req, res) => {
  validateJwt(req, res, async () => {
    const userId = req.userId;
    const user = await PlayerService.getUserRequests(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send(user);
  });
};

exports.getUserCosmetics = async (req, res) => {
  validateJwt(req, res, async () => {
    const userId = req.userId;
    const user = await PlayerService.getUserCosmetics(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send(user);
  });
};

exports.getUserPreferences = async (req, res) => {
  validateJwt(req, res, async () => {
    const userId = req.userId;
    const user = await PlayerService.getUserPreferences(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send(user);
  });
};

exports.changeHandedness = (req, res) => {
  validateJwt(req, res, async () => {
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
  validateJwt(req, res, async () => {
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
  validateJwt(req, res, async () => {
    const { cosmeticId } = req.body;
    const userId = req.userId;
    try {
      const player = await PlayerService.equipCosmetic(userId, cosmeticId);
      res.json(player);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
}
