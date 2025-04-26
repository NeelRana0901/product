require("dotenv").config();

const { db } = require("../config/dbConfig");
const { generateErrorLogs, decodeToken, decrypt, getUserAgentDetail } = require("./../utils/helper");

// Auth Access Token
async function authAccessToken(req, res, next) {
  let bearerHeader = req.headers['authorization'];

  try {
    if (!bearerHeader) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    let aToken = bearerHeader.split(" ")[1];

    let decodedToken = decodeToken(aToken);
    if (!decodedToken.status) {
      if (decodedToken.message === "Token Expired") {
        return res.status(501).json({ message: "Token Expired" });
      }
      return res.status(401).json({ message: decodedToken.message });
    }

    let checkUserToken = await db.tokens.findOne({
      access_token: aToken, user_id: decodedToken.data.user_id, is_deleted: false
    }).lean();

    if (!checkUserToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let userAgent = getUserAgentDetail(req.headers['user-agent']);
    let decodedUserAgent = decrypt(decodedToken.data.device_info, process.env.SECRET_KEY);

    if (decodedUserAgent == JSON.stringify(userAgent)) {
      req.user_id = decodedToken.data.user_id;
      req.access_token = aToken;
      req.role = decodedToken.data.role;
      next();
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } catch (e) {
    generateErrorLogs(req.url, req.body, e);

    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// Auth Refresh Token
async function authRefreshToken(req, res, next) {
  let bearerHeader = req.headers['authorization'];

  try {
    const rToken = bearerHeader.split(" ")[1];

    let decodedToken = decodeToken(rToken);
    if (!decodedToken.status) {
      return res.status(401).json({ message: decodedToken.message });
    }

    let checkToken = await db.tokens.findOne({
      refresh_token: rToken, access_token: decodedToken.data.data, is_deleted: false
    }).lean();

    if (!checkToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    let userAgent = getUserAgentDetail(req.headers['user-agent']);

    if (checkToken.device_info == JSON.stringify(userAgent)) {
      req.refresh_token = rToken;
      req.user_id = checkToken.user_id;
      next();
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } catch (e) {
    generateErrorLogs(req.url, req.body, e);

    return res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = {
  authAccessToken,
  authRefreshToken
};
