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
    const minutes = process.env.EVERY_MINUTES || 45

    const optionsCron = {
        scheduled: true,
        timezone
    }

    consoleMessage(`📆 Cron every ${minutes} minutes..`, 'greenBright')

    cron.schedule(`*/${minutes} * * * *`, () => {
        initAll()
    }, optionsCron);

}

cronStart()
dbConnect()


