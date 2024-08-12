const jwt = require("jsonwebtoken");
const axios = require("axios");
const jwkToPem = require("jwk-to-pem");
const crypto = require("crypto");

const PLAYSTATION_PUBLIC_KEY_URL =
  "https://s2s.sp-int.playstation.net/api/authz/v3/oauth/jwks";

async function validatePSNSession(idToken) {
  try {
    const response = await axios.get(PLAYSTATION_PUBLIC_KEY_URL);
    const keys = response.data.keys;
    // console.log("Fetched keys:", JSON.stringify(keys, null, 2));

    const [headerb64, payloadb64, signatureb64] = idToken.split(".");
    // console.log("Token parts:", {
    //   headerb64,
    //   payloadb64,
    //   signatureb64: signatureb64.substring(0, 10) + "...",
    // });

    const decodedHeader = JSON.parse(
      Buffer.from(headerb64, "base64").toString(),
    );
    // console.log("Decoded header:", JSON.stringify(decodedHeader, null, 2));

    const decodedPayload = JSON.parse(
      Buffer.from(payloadb64, "base64").toString(),
    );
    // console.log("Decoded payload:", JSON.stringify(decodedPayload, null, 2));

    const kid = decodedHeader.kid;
    const key = keys.find((k) => k.kid === kid);
    if (!key) {
      throw new Error("Public key not found for the given kid.");
    }
    // console.log("Matched key:", JSON.stringify(key, null, 2));

    const publicKey = jwkToPem(key);
    // console.log(
    //   "Converted public key (first 100 chars):",
    //   publicKey.substring(0, 100),
    // );

    const algorithm =
      decodedHeader.alg || (key.kty === "RSA" ? "RS256" : "ES256");
    // console.log("Using algorithm:", algorithm);

    // Try manual verification
    // const signatureBase64Url = signatureb64
    //   .replace(/-/g, "+")
    //   .replace(/_/g, "/");
    // const signature = Buffer.from(signatureBase64Url, "base64");
    // const signedPart = `${headerb64}.${payloadb64}`;
    // const verifier = crypto.createVerify("RSA-SHA256");
    // verifier.update(signedPart);
    // const isValid = verifier.verify(publicKey, signature);
    // console.log("Manual verification result:", isValid);

    // Try jwt.verify
    try {
      const decodedToken = jwt.verify(idToken, publicKey, {
        algorithms: [algorithm],
      });
      console.log("Token verified successfully");
      console.log("Decoded token:", JSON.stringify(decodedToken, null, 2));
    } catch (jwtError) {
      console.error("jwt.verify failed:", jwtError.message);
    }

    // if (!isValid) {
    //   throw new Error("Invalid signature");
    // }

    return {
      decodedPayload,
    };
  } catch (error) {
    console.error("Error validating PSN token:", error);
    throw new Error("Invalid token: " + error.message);
  }
}

module.exports = { validatePSNSession };
