const PlayerService = require("../services/playerService");
const jwt = require("jsonwebtoken");

const validateJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader ||!authHeader.startsWith('Bearer ')) {
    return res.sendStatus(401); // Unauthorized
  }

  const token = authHeader.split(' ')[1];
  console.log('Token:', token); // Debug: Log the token
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, payload) => {
    if (err) {
      console.error('JWT Verification Error:', err); // Debug: Log the error
      return res.sendStatus(403); // Forbidden
    }
    console.log('Payload:', payload); // Debug: Log the payload
    req.userId = payload.userID; // Assuming the payload contains a userID property
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
    const userId = req.query.id;
    const user = await PlayerService.getUserStats(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send(user);
  });
};

exports.getUserFriends = async (req, res) => {
  validateJwt(req, res, async () => {
    const userId = req.query.id;
    const user = await PlayerService.getUserFriends(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send(user);
  });
};

exports.getUserRequests = async (req, res) => {
  validateJwt(req, res, async () => {
    const userId = req.query.id;
    const user = await PlayerService.getUserRequests(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send(user);
  });
};

exports.getUserCosmetics = async (req, res) => {
  validateJwt(req, res, async () => {
    const userId = req.query.id;
    const user = await PlayerService.getUserCosmetics(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send(user);
  });
};

exports.getUserPreferences = async (req, res) => {
  validateJwt(req, res, async () => {
    const userId = req.query.id;
    const user = await PlayerService.getUserPreferences(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send(user);
  });
};
