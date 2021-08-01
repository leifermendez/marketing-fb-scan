const mongoose = require('mongoose')

const LeadsSchema = new mongoose.Schema(
    {
        name: {
            type: String
        },
        lastName: {
            type: String
        },
        avatar: {
            type: String
        },
        uuid: {
            type: String
        },
        email: {
            type: String
        },
        source: {
            type: String
        },
    },
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model('leads', LeadsSchema)