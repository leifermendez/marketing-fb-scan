const modelLeads = require('../models/leads')
const { errorCatch } = require('../helpers/errorHandle')



const createLead = async (user) => {
    try {
        const resDetail = await modelLeads.findOneAndUpdate({ uuid: user.uuid }, user, {
            upsert: true,
            new: true
        })
        return resDetail
    } catch (e) {
        errorCatch(e)
    }
}

const createLeadBulk = async (dataParse) => {
    await modelLeads.bulkWrite(
        dataParse.map((user) =>
        ({
            updateOne: {
                filter: { uuid: user.uuid },
                update: { $set: user },
                upsert: true
            }
        })
        )
    )
}

module.exports = { createLead, createLeadBulk }