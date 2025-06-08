const mongoose = require("mongoose")

const blockedTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
type: Date, 
required: true
    }
})

// automatically remove token after they expire
blockedTokenSchema.index({expiresAt: 1}, {expireAfterSeconds: 0})

module.exports = mongoose.model("BlockedToken", blockedTokenSchema)