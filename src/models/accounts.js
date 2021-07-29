const mongoose = require('mongoose')

const AccountSchema = new mongoose.Schema(
    {
        email: {
            type: String
        },
        password: {
            type: String
        },
        lastInteractionAt: {
            type: Date,
            default: Date.now,
            require: true
        },
        language: {
            type: String,
            default: 'en'
        },
        status: {
            type: String,
            enum: ['enabled', 'disabled'],
            default: 'enabled'
        }
    },
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model('accounts', AccountSchema)