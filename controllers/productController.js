require("dotenv").config();

const { db } = require("../config/dbConfig");
const { generateErrorLogs, upload } = require("./../utils/helper");
const { userRole } = require("./../utils/enum");
const mongoose = require('mongoose');

// Product CRUD
async function createProduct(req, res) {
    const { category_id, name, description, image_url, price } = req.body;

    try {
        let created_by = req.user_id, user_role = req.role;

        if (user_role !== userRole.Admin) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        let saveProductDetail = new db.products({
            category_id: category_id,
            name: name,
            description: description ? description : "",
            image_url: image_url ? image_url : "",
            price: price,
            created_by: created_by
        });
        let saveProduct = await saveProductDetail.save();

        if (saveProduct) {
            return res.status(200).json({ message: "Product created successfully" });
        } else {
            return res.status(400).json({ message: "Product is not created successfully" });
        }
    } catch (e) {
        generateErrorLogs(req.url, req.body, e);

        return res.status(500).json({ message: "Internal Server Error" });
    }
}

async function uploadProductImage(req, res) {
    try {
        const imageType = req.params.image_type;

        if (imageType !== 'product') {
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

                let image_url = `http://${host}:${port}/pics/product_images/${req.file.filename}`;

                return res.status(200).json({ message: "Success", image_url });
            }
        });
    } catch (e) {
        generateErrorLogs(req.url, req.body, e);

        return res.status(500).json({ message: "Internal Server Error" });
    }
}

async function getProduct(req, res) {
    try {
        let {
            search = "",
            category,
            minPrice,
            maxPrice,
            sortBy = "createdAt",
            sortOrder = "desc",
            page = 1,
            limit = 10,
        } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);
        const skip = (page - 1) * limit;

        const query = { is_deleted: false };

        if (search) {
            query.name = { $regex: search, $options: "i" };
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

        if (category) {
            query.category_id = category;
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        const products = await db.products
            .find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await db.products.countDocuments(query);

        if (products && products.length) {
            return res.json({
                data: products,
                pagination: {
                    total,
                    page,
                    limit,
                },
            });
        } else {
            return res.status(200).json({ message: "Product not found" });
        }
    } catch (e) {
        generateErrorLogs(req.url, req.body, e);

        return res.status(500).json({ message: "Internal Server Error" });
    }
}

async function getCategory(req, res) {
    try {
        let getCategoryDetail = await db.productCategories.find({}).lean();

        if (getCategoryDetail && getCategoryDetail.length) {
            return res.status(200).json({ message: "Success", data: getCategoryDetail });
        } else {
            return res.status(400).json({ message: "Category not found" });
        }
    } catch (e) {
        generateErrorLogs(req.url, req.body, e);

        return res.status(500).json({ message: "Internal Server Error" });
    }
}

async function updateProductDetail(req, res) {
    const { name, description, image_url, price } = req.body, { product_id } = req.params;

    try {
        let updated_by = req.user_id, user_role = req.role;

        if (user_role !== userRole.Admin) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        let updateProductDetail = await db.products.updateOne({ _id: product_id }, {
            name: name,
            description: description,
            image_url: image_url,
            price: price,
            updated_by: updated_by
        });

        if (updateProductDetail && updateProductDetail.modifiedCount) {
            return res.status(200).json({ message: "Product updated successfully" });
        } else {
            return res.status(400).json({ message: "Product is not updated successfully" });
        }
    } catch (e) {
        generateErrorLogs(req.url, req.body, e);

        return res.status(500).json({ message: "Internal Server Error" });
    }
}

async function deleteProduct(req, res) {
    const { product_id } = req.params;

    try {
        let updated_by = req.user_id, user_role = req.role;

        if (user_role !== userRole.Admin) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        let updateProductDetail = await db.products.updateOne({ _id: product_id }, {
            is_deleted: true,
            updated_by: updated_by
        });

        if (!updateProductDetail.acknowledged) {
            return res.status(400).json({ message: "Product is not deleted successfully" });
        }

        return res.status(200).json({ message: "Product deleted successfully" });
    } catch (e) {
        generateErrorLogs(req.url, req.body, e);

        return res.status(500).json({ message: "Internal Server Error" });
    }
}

// Favorite Product
async function favoriteProduct(req, res) {
    const { product_id } = req.params, { is_favorite } = req.body;

    try {
        let user_id = req.user_id;

        if (is_favorite) {
            let saveFavoriteProduct = new db.favoriteProducts({
                product_id: product_id,
                user_id: user_id
            });

            let saveFavoriteProductDetail = await saveFavoriteProduct.save();

            if (saveFavoriteProductDetail) {
                return res.status(200).json({ message: "Product added to favorite successfully" });
            } else {
                return res.status(400).json({ message: "Product is not added to favorite successfully" });
            }
        } else {
            let updateFavoriteProductDetail = await db.favoriteProducts.updateOne({ product_id: product_id, user_id: user_id }, {
                is_deleted: true
            });

            if (updateFavoriteProductDetail && updateFavoriteProductDetail.modifiedCount) {
                return res.status(200).json({ message: "Product removed from favorite successfully" });
            } else {
                return res.status(400).json({ message: "Product is not removed from favorite successfully" });
            }
        }
    } catch (e) {
        generateErrorLogs(req.url, req.body, e);

        return res.status(500).json({ message: "Internal Server Error" });
    }
}

async function getFavoriteProduct(req, res) {
    try {
        let user_id = req.user_id;

        let getFavoriteProductDetail = await db.favoriteProducts.find({ user_id: user_id, is_deleted: false }).populate("product_id", { name: 1, description: 1, image_url: 1, price: 1 }).lean();

        if (!getFavoriteProductDetail) {
            return res.status(400).json({ message: "Product not found" });
        }

        return res.status(200).json({ message: "Success", data: getFavoriteProductDetail });
    } catch (e) {
        generateErrorLogs(req.url, req.body, e);

        return res.status(500).json({ message: "Internal Server Error" });
    }
}

// Product Review
async function productReview(req, res) {
    const { rating, review } = req.body, { product_id } = req.params;

    try {
        let user_id = req.user_id;

        let saveProductReview = new db.productReviews({
            product_id: product_id,
            user_id: user_id,
            rating: rating,
            review: review ? review : ""
        });

        let saveInfo = await saveProductReview.save();

        if (saveInfo) {
            return res.status(200).json({ message: "Product review added successfully" });
        } else {
            return res.status(400).json({ message: "Product review is not added successfully" });
        }
    } catch (e) {
        generateErrorLogs(req.url, req.body, e);

        return res.status(500).json({ message: "Internal Server Error" });
    }
}

async function getProductReview(req, res) {
    try {
        let user_id = req.user_id;

        let getProductReviewDetail = await db.productReviews.find({ user_id: user_id }).populate("user_id", { name: 1 }).populate("product_id", { name: 1 }).lean();

        if (!getProductReviewDetail) {
            return res.status(400).json({ message: "Product review not found" });
        } else {
            return res.status(200).json({ message: "Success", data: getProductReviewDetail });
        }
    } catch (e) {
        generateErrorLogs(req.url, req.body, e);

        return res.status(500).json({ message: "Internal Server Error" });
    }
}

// Get Product Average Rating
async function getProductAverageRating(req, res) {
    const { product_id } = req.params;

    try {
        const result = await db.productReviews.aggregate([
            {
                $match: {
                    product_id: new mongoose.Types.ObjectId(product_id),
                    is_deleted: false
                }
            },
            {
                $group: {
                    _id: "$product_id",
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $unwind: "$product"
            },
            {
                $project: {
                    _id: 0,
                    product_id: "$_id",
                    product_name: "$product.name",
                    averageRating: { $round: ["$averageRating", 2] },
                    totalReviews: 1
                }
            }
        ]);

        if (result.length === 0) {
            return res.status(404).json({ message: "No reviews found for this product." });
        }

        return res.json(result[0]);
    } catch (e) {
        generateErrorLogs(req.url, req.body, e);

        return res.status(500).json({ message: "Internal Server Error" });
    }
}

// Suggest Product
async function suggestProduct(req, res) {
    const { q } = req.query;

    try {
        if (!q) return res.status(400).json({ message: "Query is required" });

        let suggestProductDetail = await db.products.find({ name: { $regex: q, $options: "i" }, is_deleted: false }, { name: 1, price: 1 }).lean();

        if (!suggestProductDetail) {
            return res.status(400).json({ message: "Product not found" });
        } else {
            return res.status(200).json({ message: "Success", data: suggestProductDetail });
        }
    } catch (e) {
        generateErrorLogs(req.url, req.body, e);

        return res.status(500).json({ message: "Internal Server Error" });
    }
}

// Trending Product
async function trendingProduct(req, res) {
    try {
        const result = await db.productReviews.aggregate([
            { $match: { is_deleted: false } },
            {
                $group: {
                    _id: "$product_id",
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" },
            {
                $match: { "product.is_deleted": false }
            },
            {
                $project: {
                    _id: 0,
                    product_id: "$_id",
                    name: "$product.name",
                    price: "$product.price",
                    averageRating: { $round: ["$averageRating", 2] },
                    totalReviews: 1
                }
            },
            { $sort: { averageRating: -1, totalReviews: -1 } },
            { $limit: 10 }
        ]);

        if (result && result.length) {
            return res.status(200).json({ message: "Success", data: result });
        } else {
            return res.status(200).json({ message: "No data found", data: [] });
        }
    } catch (e) {
        generateErrorLogs(req.url, req.body, e);

        return res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = {
    createProduct,
    uploadProductImage,
    updateProductDetail,
    deleteProduct,
    favoriteProduct,
    getFavoriteProduct,
    productReview,
    getProductReview,
    getProductAverageRating,
    suggestProduct,
    trendingProduct,
    getProduct,
    getCategory
};

