const errorModel = require('../models/errors')

const errorCatch = async (err, trace) => {
    console.log('Error', err)
    errorModel.create({ trace, extra: err })
}

module.exports = { errorCatch }