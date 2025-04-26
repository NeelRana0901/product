module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      product_id: { type: mongoose.Schema.Types.ObjectId, ref: "products", required: true },
      user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
      is_deleted: { type: Boolean, default: false },
    },
    { timestamps: true, createAt: "created_at", updateAt: "updated_at" }
  );

  const FavoriteProducts = mongoose.model("favoriteproducts", schema);
  return FavoriteProducts;
};
