const groupModel = require('../models/group')
const groupLogModel = require('../models/groupLog')
const { consoleMessage } = require('../helpers/console')
const { errorCatch } = require('../helpers/errorHandle')
const moment = require('moment')

const getGroup = async () => {
    try {
        const resDetail = await groupModel.findOne(
            {},
            null,
            {
                sort: { lastInteractionAt: 1 }
            }
        )
        resDetail.lastInteractionAt = Date.now()
        resDetail.save()
        return resDetail
    } catch (e) {
        errorCatch(e)
    }
}

const checkLog = async ({ idGroup }) => {
    try {
        const now = moment()
        const gapMin = parseInt(process.env.GAP_MINUTES || 5);
        const check = await groupLogModel.findOne({ idGroup: '806636433469671' })
        const lastDate = now.diff(moment(check.lastInteractionAt), 'minutes');
        consoleMessage(`Check GAP Time ${lastDate} >= ${gapMin}`, 'yellow')
        return (lastDate >= gapMin)
    } catch (e) {
        errorCatch(e)
    }
}

const saveLog = async ({ idGroup, message }) => {
    const data = {
        idGroup,
        message,
        lastInteractionAt: Date.now()
    }
    await groupLogModel.create(data)
}

const getAll = async () => {
    const list = await groupModel.find({})
    return list
}

module.exports = { getGroup, saveLog, checkLog, getAll }