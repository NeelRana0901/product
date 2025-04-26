module.exports = (mongoose) => {
    const schema = mongoose.Schema(
        {
            user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
            login_or_logout: { type: Number, enum: [0, 1], default: 0 },
            ip: { type: String, default: null },
            device_info: { type: String, default: null },
            login_logout_datetime: { type: Date, required: true },
            is_deleted: { type: Boolean, default: false },
        },
        { timestamps: true, createAt: "created_at", updateAt: "updated_at" }
    );

    const loginLogs = mongoose.model("loginlogs", schema);
    return loginLogs;
};
