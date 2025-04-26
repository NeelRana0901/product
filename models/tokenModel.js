module.exports = (mongoose) => {
    const schema = mongoose.Schema(
        {
            access_token: { type: String, required: true },
            refresh_token: { type: String, required: true },
            user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
            device_info: { type: String, required: true },
            is_deleted: { type: Boolean, default: false },
        },
        { timestamps: true, createAt: "created_at", updateAt: "updated_at" }
    );

    const tokens = mongoose.model("tokens", schema);
    return tokens;
};
