module.exports = (mongoose) => {
    const schema = mongoose.Schema(
        {
            name: { type: String, required: true },
            description: { type: String, default: null },
            is_deleted: { type: Boolean, default: false },
        },
        { timestamps: true, createAt: "created_at", updateAt: "updated_at" }
    );

    const ProductCategories = mongoose.model("productcategories", schema);
    return ProductCategories;
};
