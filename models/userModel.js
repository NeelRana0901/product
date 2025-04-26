module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true },
      password: { type: String, required: true },
      phone_no: { type: String, required: true },
      profile_image: { type: String, default: null },
      role: { type: Number, default: 1, enum: [0, 1], default: 1 },
      recently_viewed_product_id: { type: mongoose.Schema.Types.ObjectId, ref: "products", default: null },
      is_deleted: { type: Boolean, default: false },
    },
    { timestamps: true, createAt: "created_at", updateAt: "updated_at" }
  );

  const Users = mongoose.model("users", schema);
  return Users;
};
