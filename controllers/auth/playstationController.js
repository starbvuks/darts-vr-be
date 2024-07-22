const psnService = require("../../services/auth/playstationService");
const Player = require("../../models/Player");
const authService = require("../../services/auth/authService");
const jwt = require("jsonwebtoken");

exports.validatePSNSession = async (req, res) => {
  try {
    // const { idToken } = req.body;
    const idToken = "eyJraWQiOiJzcGludF8yIiwiYWxnIjoiUlMyNTYifQ.eyJhZ2UiOjMxLCJhdF9oYXNoIjoiNG95VkVoYjc3REtCb3czMVRBV3BSdyIsImF1ZCI6WyI2ODY5ODZhNi0zYjM0LTRhNDItODlkMS1iNGJhMTkzYmM4MGYiXSwiYXV0aF9tb2RlIjoiU1RBTkRBUkQiLCJkZXZpY2VfdHlwZSI6IlBTNSIsImVudl9pc3NfaWQiOiIxIiwiZXhwIjoxNzIxNjQ4OTMwLCJpYXQiOjE3MjE2NDc3MzAsImlzcyI6Imh0dHBzOi8vYXV0aC5hY2NvdW50LnNvbnkuY29tIiwibGVnYWxfY291bnRyeSI6IklOIiwibG9jYWxlIjoiZW4tR0IiLCJvbmxpbmVfaWQiOiJmcmFua2llZ3QiLCJzdWIiOiI0MDU2NjI2NTk2NTA2MDc3NzY4IiwidmVyIjoiMyJ9.O9k9b53JxicDw4n0eL0gBVdjEdaAOzHIFMlqiYrhS1oVsHzP4ISwqqk554BFlaR9oXKDaUmwtHAU5U5W3-rUej7CdZtCxQZEedZQ-QjHIYMxVrNe-Q2_fXM_UwGLLXDr3cVrOpfVjvuk3KWiUwxCW8FZGfG75UCvyS64KktqHXeh4iUyF_4ZW-0Rlc9vPGZEdHJokIcPzAzKIwRdBrPM6KXQyTIUq1ji0hp9xgEOBN0Rsn46t8IwC4VmcWt7xS-qGMm48N_Zz1EKf3SwIDufqvpRgKTBX0WuB-ToTMSBNa2XtQwvURRuhXQhsGHegDCWU-4atxL16pvlLADdPuR4djl9tFVY2zgcNjxSxVqcK1GCKrnbA-lMTVV2R3wbsDb0PcbpUib8seY7n7fcvi-x9y_gyD02vYhSqXZ3VoDzXSTXZuv9Klew4h85bq5pLuPl9biLtxkId4hoAeUvt0JVuw7SZ0iiuGrg6-OjakZt5Ti13YAHid0LR-sz7F71YMId"

    // Validate the ID token
    const { online_id, age, device_type } = await psnService.validatePSNSession(idToken);

    // Check if the user exists
    let player = await Player.findOne({ "auth.platformId": online_id });

    if (!player) {
      // Create a new player document if it doesn't exist
      player = new Player({
        auth: [
          {
            platform: "PlayStation",
            platformId: online_id,
          },
        ],
        profile: {
          cosmetics: {
            hat: {
              hatId: "667cfdf66b5fa5683c6eae99",
            },
            hands: {
              handsId: "667cfdf66b5fa5683c6eae9a",
            },
            dartSkin: {
              dartSkinId: "667cfdf66b5fa5683c6eae9b",
            },
            glasses: {
              glassesId: "667cfdf66b5fa5683c6eae9c",
            },
            gender: {
              genderId: "667cfdf66b5fa5683c6eae9d",
            },
          },
        },
      });
      await player.save();
    }

    const { accessToken, refreshToken } = await authService.generateTokens(
      player._id
    );

    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error("PSN auth error:", error);
    res.status(400).json({ error: error.message });
  }
};