const scrollPageToBottom = require('puppeteer-autoscroll-down')

const autoScroll = async (page, step, delay) => {
    return scrollPageToBottom(page, step, delay)
}

module.exports = autoScroll