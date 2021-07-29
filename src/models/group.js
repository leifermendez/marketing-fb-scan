const mongoose = require('mongoose')

const GroupSchma = new mongoose.Schema(
    {
        name: {
            type: String
        },
        idGroup: {
            type: String
        },
        tag: {
            type: Array,
            default: []
        },
        public: {
            type: Boolean
        },
        fbGroupMobile: {
            type: String
        },
        lastInteractionAt: {
            type: Date
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
)

module.exports = mongoose.model('group', GroupSchma)