require('dotenv').config()
const puppeteer = require('puppeteer-extra')
const { Cluster } = require('puppeteer-cluster');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const { dbConnect } = require('../config/mongo')
puppeteer.use(StealthPlugin())
const cron = require('node-cron')
const { consoleMessage } = require('./helpers/console')
const { puppeterConfig } = require('../config/config')
const { scanMembers } = require('./controllers/login')
const { getGroup } = require('./controllers/groups')
const listMessages = require('./controllers/excel')
const moment = require('moment')


/**
 * //TODO: Iniciamos cola de proceso de puppeter
 */


const initAll = async () => {

    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 1,
        puppeteerOptions: puppeterConfig,
        retryLimit: 0,
        timeout: 600000
    });

    const group = await getGroup()
    cluster.queue(group, scanMembers);
    await cluster.idle();
    await cluster.close();


}

const cronStart = async () => {
    const timezone = process.env.TIMEZONE || "Europe/Madrid"

    const optionsCron = {
        scheduled: true,
        timezone
    }

    consoleMessage(`📆 Cron every day 10:00 AM ...`, 'greenBright')

    cron.schedule(`*/30 * * * *`, () => {
        initAll()
    }, optionsCron);

}

cronStart()
dbConnect()


