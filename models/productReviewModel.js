module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      product_id: { type: mongoose.Schema.Types.ObjectId, ref: "products", required: true },
      rating: { type: Number, default: 1, enum: [1, 2, 3, 4, 5] },
      review: { type: String, required: true },
      user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
      is_deleted: { type: Boolean, default: false },
    },
    { timestamps: true, createAt: "created_at", updateAt: "updated_at" }
  );

  const ProductReviews = mongoose.model("productreviews", schema);
  return ProductReviews;
};
