require("dotenv").config();

const { db } = require("../config/dbConfig");
const { generateErrorLogs, encrypt, decrypt, getUserAgentDetail, generateToken } = require("./../utils/helper");
const { loginStatus } = require("./../utils/enum");

// User Login
async function login(req, res) {
    const { email, password } = req.body;

    try {
        let user = await db.users.findOne({ email: email }).lean();

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        let decryptedPassword = decrypt(user.password, password);

        if (decryptedPassword !== password) {
            return res.status(400).json({ message: "Invalid Password" });
        }

        let userAgent = getUserAgentDetail(req.headers['user-agent']);

        let saveLoginData = new db.loginLogs({
            user_id: user._id,
            login_or_logout: loginStatus.Login,
            ip: req.ip,
            device_info: JSON.stringify(userAgent),
            login_logout_datetime: new Date(),
        });

        await saveLoginData.save();

        let tokenResponse = {
            user_id: user._id,
            role: user.role,
            device_info: encrypt(JSON.stringify(userAgent), process.env.SECRET_KEY),
        };

        let accessTokenData = generateToken(tokenResponse);
        if (!accessTokenData.status) {
            return res.status(400).json({ message: accessTokenData.message });
        }

        let refreshTokenData = generateToken(accessTokenData.token);
        if (!refreshTokenData.status) {
            return res.status(400).json({ message: refreshTokenData.message });
        }

        let accessToken = accessTokenData.token, refreshToken = refreshTokenData.token;

        let tokenData = new db.tokens({
            access_token: accessToken,
            refresh_token: refreshToken,
            user_id: user._id,
            device_info: JSON.stringify(userAgent),
        });

        await tokenData.save();

        return res.status(200).json({ message: "User loggedIn successfully", access_token: accessToken, refresh_token: refreshToken });
    } catch (e) {
        generateErrorLogs(req.url, req.body, e);

        return res.status(500).json({ message: "Internal Server Error" });
    }
}

// User Logout
async function logout(req, res) {
    try {
        let user_id = req.user_id, access_token = req.access_token;

        let updateToken = await db.tokens.updateOne({ user_id: user_id, access_token: access_token }, { $set: { is_deleted: true, access_token: "", refresh_token: "" } });

        if (!updateToken.acknowledged) {
            return res.status(400).json({ message: "Token not found" });
        }
        let userAgent = getUserAgentDetail(req.headers['user-agent']);

        let saveLoginData = new db.loginLogs({
            user_id: user_id,
            login_or_logout: loginStatus.Logout,
            ip: req.ip,
            device_info: JSON.stringify(userAgent),
            login_logout_datetime: new Date(),
        });

        await saveLoginData.save();

        return res.status(200).json({ message: "User loggedOut successfully" });
    } catch (e) {
        generateErrorLogs(req.url, req.body, e);

        return res.status(500).json({ message: "Internal Server Error" });
    }
}

// Refresh Token
async function refreshToken(req, res) {
    try {
        let user_id = req.user_id, refresh_token = req.refresh_token;

        let user = await db.users.findOne({ _id: user_id }).lean();

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        let userAgent = getUserAgentDetail(req.headers['user-agent']);

        let tokenResponse = {
            user_id: user_id,
            role: user.role,
            device_info: encrypt(JSON.stringify(userAgent), process.env.SECRET_KEY),
        };

        let accessTokenData = generateToken(tokenResponse);
        if (!accessTokenData.status) {
            return res.status(400).json({ message: accessTokenData.message });
        }

        let refreshTokenData = generateToken(accessTokenData.token);
        if (!refreshTokenData.status) {
            return res.status(400).json({ message: refreshTokenData.message });
        }

        let accessToken = accessTokenData.token, refreshToken = refreshTokenData.token;

        let updateToken = await db.tokens.updateOne({ refresh_token: refresh_token, user_id: user_id }, { $set: { access_token: accessToken, refresh_token: refreshToken } });

        if (!updateToken.acknowledged) {
            return res.status(400).json({ message: "Token not found" });
        }

        return res.status(200).json({ message: "Success", access_token: accessToken, refresh_token: refreshToken });
    } catch (e) {
        generateErrorLogs(req.url, req.body, e);

        return res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = {
    login,
    logout,
    refreshToken
};
