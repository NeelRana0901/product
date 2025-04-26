module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      api_name: { type: String, required: true },
      payload: { type: String, default: null },
      error: { type: String, default: null },
      is_deleted: { type: Boolean, default: false },
    },
    { timestamps: true, createAt: "created_at", updateAt: "updated_at" }
  );

  const apiErrorLogs = mongoose.model("apierrorlogs", schema);
  return apiErrorLogs;
};
