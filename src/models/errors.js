const mongoose = require('mongoose')

const ErrosSchema = new mongoose.Schema(
    {
        trace: {
            type: String
        },
        extra: {
            type: Object
        }
    },
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model('errors', ErrosSchema)