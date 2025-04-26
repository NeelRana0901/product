require("dotenv").config();

const { db } = require("../config/dbConfig");
const { generateErrorLogs, upload, encrypt } = require("./../utils/helper");

// User Registration
async function registration(req, res) {
    const { name, email, password, phone_no, profile_image, role } = req.body;

    try {
        let encryptedPassword = encrypt(password, password);

        let saveUserDetail = new db.users({
            name: name,
            email: email,
            password: encryptedPassword,
            phone_no: phone_no,
            profile_image: profile_image ? profile_image : "",
            role: role,
        });
        let saveUser = await saveUserDetail.save();

        if (saveUser) {
            return res.status(200).json({ message: "User created successfully" });
        } else {
            return res.status(400).json({ message: "User is not created successfully" });
        }
    } catch (e) {
        generateErrorLogs(req.url, req.body, e);

        return res.status(500).json({ message: "Internal Server Error" });
    }
}

// Upload Profile Image
async function uploadProfileImage(req, res) {
    try {
        const imageType = req.params.image_type;

        if (imageType !== 'profile') {
            return res.status(400).json({ message: "Invalid Image Type" });
        }

        upload(req, res, (e) => {
            if (e) {
                if (e.code === 'LIMIT_FILE_SIZE') {
                    generateErrorLogs(req.url, req.body, e);

                    return res.status(400).json({ message: "File Size Exceeded" });
                } else {
                    generateErrorLogs(req.url, req.body, e);

                    return res.status(400).json({ message: "Error Uploading File" });
                }
            } else if (req.fileError) {
                generateErrorLogs(req.url, req.body, e);

                return res.status(400).json({ message: req.fileError });
            } else {
                const port = process.env.PORT;
                const host = process.env.HOST || "localhost";

                let image_url = `http://${host}:${port}/pics/profile_images/${req.file.filename}`;

                return res.status(200).json({ message: "Success", image_url });
            }
        });
    } catch (e) {
        generateErrorLogs(req.url, req.body, e);
        console.log(e)
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

// Get Profile Details
async function getProfileDetails(req, res) {
    try {
        let user_id = req.user_id;

        let getuserDetail = await db.users.findOne({ _id: user_id }).populate('recently_viewed_product_id', { name: 1 }).lean();

        if (!getuserDetail) {
            return res.status(400).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "Success", data: getuserDetail });
    } catch (e) {
        generateErrorLogs(req.url, req.body, e);

        return res.status(500).json({ message: "Internal Server Error" });
    }
}

// Recently Viewed Product
async function recentlyViewedProduct(req, res) {
    const { product_id } = req.params;

    try {
        let user_id = req.user_id;

        let updateProduct = await db.users.updateOne({ _id: user_id }, {
            $set: { recently_viewed_product_id: product_id }
        });

        if (updateProduct && updateProduct.modifiedCount) {
            return res.status(200).json({ message: "Success" });
        } else {
            return res.status(400).json({ message: "Failed" });
        }
    } catch (e) {
        generateErrorLogs(req.url, req.body, e);

        return res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = {
    registration,
    getProfileDetails,
    uploadProfileImage,
    recentlyViewedProduct
};
