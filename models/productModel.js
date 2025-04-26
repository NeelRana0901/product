const productCategoryModel = require("./productCategoryModel");

module.exports = (mongoose) => {
    const schema = mongoose.Schema(
        {
            category_id: { type: mongoose.Schema.Types.ObjectId, ref: "productCategories", required: true },
            name: { type: String, required: true },
            description: { type: String, default: null },
            image_url: { type: String, default: null },
            price: { type: Number, required: true },
            created_by: { type: String, default: null },
            updated_by: { type: String, default: null },
            is_deleted: { type: Boolean, default: false },
        },
        { timestamps: true, createAt: "created_at", updateAt: "updated_at" }
    );

    const Products = mongoose.model("products", schema);
    return Products;
};
