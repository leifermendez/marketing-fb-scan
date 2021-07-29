const modelAccount = require('../models/accounts')
const { errorCatch } = require('../helpers/errorHandle')

const createAccount = async (data) => {
    try {
        const { email, } = data
        const resDetail = await modelAccount.findOneAndUpdate({ email },
            {
                ...data, ...{
                    status: 'enabled',
                    lastInteractionAt: Date.now()
                }
            }, {
            upsert: true,
            new: true
        })
        return resDetail
    } catch (e) {
        errorCatch(e)
    }
}

const getAccount = async () => {
    try {
        const lastUser = await modelAccount.findOneAndUpdate(
            {
                status: 'enabled'
            },
            {
                lastInteractionAt: Date.now()
            }, {
            sort: { lastInteractionAt: 1 },
            upsert: true,
            new: true
        })
        return lastUser;
    } catch (e) {
        errorCatch(e)
    }
}

module.exports = { createAccount, getAccount }