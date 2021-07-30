require('dotenv').config()
const puppeteer = require('puppeteer-extra')
const express = require('express')
const { Cluster } = require('puppeteer-cluster');
const cors = require('cors')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const { dbConnect } = require('../config/mongo')
puppeteer.use(StealthPlugin())
const app = express()
const { puppeterConfig } = require('../config/config')
const { getAll } = require('./controllers/groups')
const { joinGroup } = require('./controllers/login')

app.use(cors())
app.use(express.json())


/**
 * //TODO: Iniciamos cola de proceso de puppeter
 */


const initAll = async () => {

    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 1,
        puppeteerOptions: puppeterConfig
    });

    const list = await getAll();

    list.forEach(group => {
        cluster.queue(group, joinGroup);
    })

    await cluster.idle();
    await cluster.close();
}

const cronStart = async () => {

    const MINUTE = process.env.MINUTES || 10;
    consoleMessage(`📆 Cron every ${MINUTE} minutes...`, 'greenBright')
    cron.schedule(`*/${MINUTE} * * * *`, () => {
        initAll()
    });
}
initAll()
// cronStart()
dbConnect()


