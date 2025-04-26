require("dotenv").config();

const UAParser = require("ua-parser-js");
const multer = require('multer');
const moment = require('moment');
const CryptoJS = require("crypto-js");
const { db } = require("../config/dbConfig");
const path = require("path");
const jwt = require("jsonwebtoken");

function validateSchema(schema) {
  try {
    return (req, res, next) => {
      const { error } = schema.validate(req.body);
      if (!error) {
        return next();
      } else {
        const { details } = error;
        const message = details.map((i) => i.message.replace(/['"]+/g, "")).join(",");
        return res.status(400).json({ e: message });
      }
    };
  } catch (e) {
    throw new Error(e.message);
  }
};

function encrypt(data, key) {
  try {
    const cipherText = CryptoJS.AES.encrypt(data, key).toString();
    return cipherText;
  } catch (e) {
    throw new Error(e.message);
  }
};

function decrypt(data, key) {
  try {
    const bytes = CryptoJS.AES.decrypt(data, key);
    if (bytes.sigBytes > 0) {
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      return decryptedData;
    } else {
      return false;
    }
  } catch (e) {
    throw new Error(e.message);
  }
};

async function generateErrorLogs(apiName, payload, error) {
  try {
    let saveErrorLogs = new db.apiErrorLogs({
      api_name: apiName,
      payload: JSON.stringify(payload),
      error: JSON.stringify(error),
    });

    await saveErrorLogs.save();
    return true;
  } catch (e) {
    throw new Error(e.message);
  }
};

function getUserAgentDetail(userAgent) {
  try {
    const UA = new UAParser(userAgent);

    let userAgentDetails = {
      browser_name: UA.getBrowser().name ? UA.getBrowser().name : "No Data",
      browser_version: UA.getBrowser().version ? UA.getBrowser().version : "No Data",
      cpu_architecture: UA.getCPU().architecture ? UA.getCPU().architecture : "No Data",
      device_type: UA.getDevice().type ? UA.getDevice().type : "No Data",
      device_model: UA.getDevice().model ? UA.getDevice().model : "No Data",
      device_vendor: UA.getDevice().vendor ? UA.getDevice().vendor : "No Data",
      engine_name: UA.getEngine().name ? UA.getEngine().name : "No Data",
      engine_version: UA.getEngine().version ? UA.getEngine().version : "No Data",
      os_name: UA.getOS().name ? UA.getOS().name : "No Data",
      os_version: UA.getOS().version ? UA.getOS().version : "No Data",
      ua_info: UA.getUA() ? UA.getUA() : "No Data"
    };

    return userAgentDetails;
  } catch (error) {
    return {};
  }
};

function generateToken(data) {
  try {
    let expiryTime, payload;

    if (typeof data === 'string') {
      expiryTime = "30d";
      payload = { data };
    } else {
      expiryTime = "15m";
      payload = data;
    }

    return { status: true, message: "success", token: jwt.sign(payload, process.env.KEY, { expiresIn: expiryTime }) };
  } catch (e) {
    return { status: false, message: e.message };
  }
};

function decodeToken(token) {
  try {
    let decodedData = jwt.verify(token, process.env.KEY);
    return { status: true, message: "success", data: decodedData };
  } catch (e) {
    if (e.message === "jwt expired") {
      return { status: false, message: "Token Expired" };
    } else {
      return { status: false, message: e.message };
    }
  }
};

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const imageType = req.params.image_type; // should be either 'profile' or 'product'

      let uploadPath;
      if (imageType === 'product') {
        uploadPath = process.env.PRODUCT_IMAGE_PATH;
      } else {
        uploadPath = process.env.PROFILE_IMAGE_PATH;
      }

      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      let file_name = file.fieldname + '_' + moment().format('YYYY-MM-DD_HH-mm-ss') + path.extname(file.originalname);
      cb(null, file_name);
    }
  }),
  limits: {
    fileSize: 1024 * 1024 * 50 // 50MB
  },
  fileFilter: function (req, file, cb) {
    if (["image/jpg", "image/jpeg", "image/png"].includes(file.mimetype)) {
      cb(null, true);
    } else {
      req.fileError = "File Type Not Supported";
      cb(null, false);
    }
  }
}).single('image');


module.exports = {
  validateSchema,
  encrypt,
  decrypt,
  generateToken,
  decodeToken,
  getUserAgentDetail,
  generateErrorLogs,
  upload,
};
